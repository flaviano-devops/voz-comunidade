import "./styles.css";
import { isSupabaseConfigured } from "./lib/supabase";

type ViewName = "feed" | "chat" | "profile" | "saved";
type FeedFilter = "all" | "featured" | "following" | "new";
type PostMood = "Ideia" | "Arte" | "Pergunta" | "Discussao";

interface Profile {
  displayName: string;
  handle: string;
  bio: string;
  avatar: string;
}

interface Comment {
  id: string;
  author: string;
  text: string;
}

interface Post {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  text: string;
  tags: string[];
  likes: number;
  featured: boolean;
  mood: PostMood;
  createdAt: string;
  image?: boolean;
  comments: Comment[];
}

interface ChatMessage {
  id: string;
  name: string;
  text: string;
  createdAt: string;
}

interface AppState {
  profile: Profile;
  posts: Post[];
  chat: ChatMessage[];
  likedIds: string[];
  savedIds: string[];
  activeFilter: FeedFilter;
  selectedMood: PostMood;
}

const storageKey = "voz-community-state-v2";

const defaultProfile: Profile = {
  displayName: "Flaviano",
  handle: "@fundador",
  bio: "Construindo uma comunidade universal.",
  avatar: "F",
};

const starterPosts: Post[] = [
  {
    id: crypto.randomUUID(),
    author: "Lia",
    handle: "@liart",
    avatar: "L",
    text: "Terminei um estudo de personagem e queria um lugar simples para postar sem escolher comunidade. Esse feed unico resolve muito.",
    tags: ["arte", "personagem"],
    likes: 42,
    featured: true,
    mood: "Arte",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    image: true,
    comments: [
      {
        id: crypto.randomUUID(),
        author: "Nina",
        text: "A ideia de um feed unico deixa tudo mais facil de descobrir.",
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    author: "Mateus",
    handle: "@mestre",
    avatar: "M",
    text: "Ideia para o app: deixar as tags substituirem comunidades no inicio. Depois, quando tiver massa critica, comunidades podem nascer dos assuntos mais usados.",
    tags: ["rpg", "produto"],
    likes: 31,
    featured: true,
    mood: "Ideia",
    createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    comments: [],
  },
  {
    id: crypto.randomUUID(),
    author: "Nina",
    handle: "@ninasama",
    avatar: "N",
    text: "Sinto falta de uma rede menor, mais de conversa, menos performance. Feed global + moderacao boa ja seria um comeco forte.",
    tags: ["anime", "off"],
    likes: 27,
    featured: false,
    mood: "Discussao",
    createdAt: new Date(Date.now() - 1000 * 60 * 51).toISOString(),
    comments: [],
  },
];

const starterChat: ChatMessage[] = [
  {
    id: crypto.randomUUID(),
    name: "Lia",
    text: "Alguem testando o feed novo?",
    createdAt: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: "Mateus",
    text: "Sim. A vibe comunidade unica ficou boa para o MVP.",
    createdAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: "Nina",
    text: "Quero abas de eventos depois.",
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
];

let state: AppState = loadState();

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Elemento #app nao encontrado.");
}

app.innerHTML = `
  <div class="app-shell">
    <aside class="sidebar" aria-label="Navegacao principal">
      <a class="brand" href="#">
        <span class="brand-mark">V</span>
        <span>
          <strong>Voz</strong>
          <small>Comunidade universal</small>
        </span>
      </a>

      <nav class="nav-list">
        <button class="nav-item active" data-view="feed" title="Feed">
          <span aria-hidden="true">#</span>
          <span>Feed</span>
        </button>
        <button class="nav-item" data-view="chat" title="Chat global">
          <span aria-hidden="true">[]</span>
          <span>Chat</span>
        </button>
        <button class="nav-item" data-view="profile" title="Meu perfil">
          <span aria-hidden="true">@</span>
          <span>Perfil</span>
        </button>
        <button class="nav-item" data-view="saved" title="Salvos">
          <span aria-hidden="true">*</span>
          <span>Salvos</span>
        </button>
      </nav>

      <div class="community-status">
        <span class="pulse"></span>
        <div>
          <strong>1 comunidade</strong>
          <small>${isSupabaseConfigured ? "Supabase conectado" : "Dados locais por enquanto"}</small>
        </div>
      </div>
    </aside>

    <main class="main-panel">
      <header class="topbar">
        <label class="search-wrap">
          <span aria-hidden="true">?</span>
          <input id="searchInput" type="search" placeholder="Buscar posts, pessoas e tags" />
        </label>
        <button class="icon-btn" id="themeToggle" title="Alternar tema" aria-label="Alternar tema">T</button>
        <button class="primary-btn" id="focusComposer">Publicar</button>
      </header>

      <section class="content-grid">
        <section class="feed-column view active" id="feedView">
          <section class="welcome-panel">
            <div>
              <span class="eyebrow">${isSupabaseConfigured ? "Banco conectado" : "Modo prototipo"}</span>
              <h1>Uma comunidade so, todo mundo no mesmo lugar.</h1>
              <p>Use tags para organizar os assuntos enquanto o app ainda nao cria comunidades separadas.</p>
            </div>
            <div class="score-card">
              <strong id="healthScore">0%</strong>
              <span>pulso da comunidade</span>
            </div>
          </section>

          <div class="composer" id="composer">
            <div class="avatar me" id="composerAvatar">F</div>
            <div class="composer-body">
              <textarea id="postText" maxlength="280" placeholder="Compartilhe algo com a comunidade"></textarea>
              <div class="mood-row" aria-label="Tipo de post">
                <button class="mood active" data-mood="Ideia">Ideia</button>
                <button class="mood" data-mood="Arte">Arte</button>
                <button class="mood" data-mood="Pergunta">Pergunta</button>
                <button class="mood" data-mood="Discussao">Discussao</button>
              </div>
              <div class="composer-actions">
                <div class="tag-row" role="list" aria-label="Tags rapidas">
                  <button data-tag="arte">Arte</button>
                  <button data-tag="rpg">RPG</button>
                  <button data-tag="anime">Anime</button>
                  <button data-tag="off">Off</button>
                </div>
                <div class="publish-group">
                  <span id="charCount">0/280</span>
                  <button class="primary-btn" id="publishPost">Enviar</button>
                </div>
              </div>
            </div>
          </div>

          <div class="filter-bar" aria-label="Filtros de feed">
            <button class="chip active" data-filter="all">Tudo</button>
            <button class="chip" data-filter="featured">Destaques</button>
            <button class="chip" data-filter="following">Seguindo</button>
            <button class="chip" data-filter="new">Recentes</button>
          </div>

          <div id="postList" class="post-list"></div>
        </section>

        <section class="chat-column view" id="chatView">
          <div class="panel-title">
            <div>
              <h1>Chat Global</h1>
              <p>Uma sala unica para todo mundo conversar.</p>
            </div>
            <span class="online-pill" id="onlinePill">128 online</span>
          </div>
          <div class="chat-window" id="chatMessages"></div>
          <form class="chat-form" id="chatForm">
            <input id="chatInput" type="text" maxlength="160" placeholder="Escreva uma mensagem" autocomplete="off" />
            <button class="primary-btn" type="submit">Enviar</button>
          </form>
        </section>

        <section class="profile-column view" id="profileView">
          <div class="profile-hero">
            <div class="avatar profile-avatar" id="profileAvatar">F</div>
            <div>
              <h1 id="profileName">Flaviano</h1>
              <p id="profileHandle">@fundador - membro beta</p>
            </div>
          </div>
          <div class="stats-grid">
            <div><strong id="profilePostCount">0</strong><span>posts</span></div>
            <div><strong id="profileLikeCount">0</strong><span>curtidas</span></div>
            <div><strong id="profileSavedCount">0</strong><span>salvos</span></div>
          </div>
          <form class="settings-panel" id="profileForm">
            <h2>Identidade</h2>
            <label>Nome exibido<input id="displayNameInput" maxlength="28" /></label>
            <label>Usuario<input id="handleInput" maxlength="24" /></label>
            <label>Bio<textarea id="bioInput" maxlength="140"></textarea></label>
            <button class="primary-btn" type="submit">Salvar perfil</button>
          </form>
        </section>

        <section class="saved-column view" id="savedView">
          <div class="panel-title">
            <div>
              <h1>Salvos</h1>
              <p>Posts marcados aparecem aqui.</p>
            </div>
          </div>
          <div id="savedList" class="post-list empty-state"></div>
        </section>

        <aside class="right-rail">
          <section class="rail-section">
            <h2>Tendencias</h2>
            <div id="trendList"></div>
          </section>

          <section class="rail-section">
            <h2>Checklist do MVP</h2>
            <div class="mission-list">
              <label><input type="checkbox" checked disabled /> Feed universal</label>
              <label><input type="checkbox" checked disabled /> Chat global</label>
              <label><input type="checkbox" ${isSupabaseConfigured ? "checked" : ""} disabled /> Supabase</label>
              <label><input type="checkbox" disabled /> Login real</label>
            </div>
          </section>

          <section class="rail-section">
            <h2>Membros ativos</h2>
            <div id="memberList"></div>
          </section>

          <section class="rail-section rules">
            <h2>Regras</h2>
            <p>Respeito primeiro. Conteudo criativo e conversa leve tem prioridade.</p>
          </section>
        </aside>
      </section>
    </main>
  </div>

  <div class="toast" id="toast" role="status" aria-live="polite"></div>
`;

const postList = getElement<HTMLDivElement>("#postList");
const savedList = getElement<HTMLDivElement>("#savedList");
const searchInput = getElement<HTMLInputElement>("#searchInput");
const postText = getElement<HTMLTextAreaElement>("#postText");
const chatMessages = getElement<HTMLDivElement>("#chatMessages");
const chatForm = getElement<HTMLFormElement>("#chatForm");
const chatInput = getElement<HTMLInputElement>("#chatInput");
const trendList = getElement<HTMLDivElement>("#trendList");
const memberList = getElement<HTMLDivElement>("#memberList");
const toast = getElement<HTMLDivElement>("#toast");
const charCount = getElement<HTMLSpanElement>("#charCount");
const profileForm = getElement<HTMLFormElement>("#profileForm");
const displayNameInput = getElement<HTMLInputElement>("#displayNameInput");
const handleInput = getElement<HTMLInputElement>("#handleInput");
const bioInput = getElement<HTMLTextAreaElement>("#bioInput");

function getElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Elemento ${selector} nao encontrado.`);
  }
  return element;
}

function loadState(): AppState {
  const rawState = localStorage.getItem(storageKey);

  if (!rawState) {
    return {
      profile: defaultProfile,
      posts: starterPosts,
      chat: starterChat,
      likedIds: [],
      savedIds: [],
      activeFilter: "all",
      selectedMood: "Ideia",
    };
  }

  try {
    const parsed = JSON.parse(rawState) as AppState;
    return {
      ...parsed,
      profile: parsed.profile ?? defaultProfile,
      posts: parsed.posts?.length ? parsed.posts : starterPosts,
      chat: parsed.chat?.length ? parsed.chat : starterChat,
      likedIds: parsed.likedIds ?? [],
      savedIds: parsed.savedIds ?? [],
      activeFilter: parsed.activeFilter ?? "all",
      selectedMood: parsed.selectedMood ?? "Ideia",
    };
  } catch {
    localStorage.removeItem(storageKey);
    return {
      profile: defaultProfile,
      posts: starterPosts,
      chat: starterChat,
      likedIds: [],
      savedIds: [],
      activeFilter: "all",
      selectedMood: "Ideia",
    };
  }
}

function saveState(): void {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function renderAll(): void {
  renderPosts();
  renderSaved();
  renderChat();
  renderTrends();
  renderMembers();
  renderProfile();
  updateCommunityPulse();
  updateComposer();
}

function renderPosts(): void {
  const query = searchInput.value.trim().toLowerCase();
  const visiblePosts = state.posts
    .filter((post) => {
      const matchesFilter =
        state.activeFilter === "all" ||
        (state.activeFilter === "featured" && post.featured) ||
        (state.activeFilter === "following" && ["@liart", "@mestre", state.profile.handle].includes(post.handle)) ||
        state.activeFilter === "new";
      const content = `${post.author} ${post.handle} ${post.text} ${post.tags.join(" ")} ${post.mood}`.toLowerCase();
      return matchesFilter && content.includes(query);
    })
    .sort((a, b) => {
      if (state.activeFilter === "new") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return Number(b.featured) - Number(a.featured) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  postList.innerHTML = visiblePosts.length ? visiblePosts.map(postTemplate).join("") : emptyMessage("Nada encontrado nesse filtro.");
  bindPostActions(postList);
}

function renderSaved(): void {
  const savedPosts = state.posts.filter((post) => state.savedIds.includes(post.id));
  savedList.innerHTML = savedPosts.map(postTemplate).join("");
  bindPostActions(savedList);
}

function postTemplate(post: Post): string {
  const isLiked = state.likedIds.includes(post.id);
  const isSaved = state.savedIds.includes(post.id);
  const likeCount = post.likes + (isLiked ? 1 : 0);

  return `
    <article class="post" data-id="${post.id}">
      <div class="post-head">
        <div class="avatar">${escapeHtml(post.avatar)}</div>
        <div class="post-meta">
          <strong>${escapeHtml(post.author)}</strong>
          <small>${escapeHtml(post.handle)} - ${timeAgo(post.createdAt)}</small>
        </div>
        <span class="mood-pill">${escapeHtml(post.mood)}</span>
      </div>
      <p>${escapeHtml(post.text)}</p>
      ${post.image ? '<div class="post-image" role="img" aria-label="Imagem conceitual da comunidade"></div>' : ""}
      <div class="post-tags">${post.tags.map((tag) => `<span>#${escapeHtml(tag)}</span>`).join("")}</div>
      <div class="post-actions">
        <button class="action-btn ${isLiked ? "active" : ""}" data-action="like">${isLiked ? "Curtido" : "Curtir"} - ${likeCount}</button>
        <button class="action-btn" data-action="comment">Comentar - ${post.comments.length}</button>
        <button class="action-btn ${isSaved ? "active" : ""}" data-action="save">${isSaved ? "Salvo" : "Salvar"}</button>
      </div>
      <div class="comments-panel" hidden>
        <div class="comment-list">
          ${post.comments.length ? post.comments.map(commentTemplate).join("") : '<p class="muted">Seja o primeiro comentario.</p>'}
        </div>
        <form class="comment-form">
          <input type="text" maxlength="120" placeholder="Responder como ${escapeHtml(state.profile.displayName)}" />
          <button type="submit">Enviar</button>
        </form>
      </div>
    </article>
  `;
}

function commentTemplate(comment: Comment): string {
  return `
    <div class="comment">
      <strong>${escapeHtml(comment.author)}</strong>
      <span>${escapeHtml(comment.text)}</span>
    </div>
  `;
}

function bindPostActions(scope: HTMLElement): void {
  scope.querySelectorAll<HTMLButtonElement>(".action-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const postElement = button.closest<HTMLElement>(".post");
      const id = postElement?.dataset.id;
      if (!id) return;

      if (button.dataset.action === "like") {
        toggleArrayValue(state.likedIds, id);
        showToast(state.likedIds.includes(id) ? "Post curtido." : "Curtida removida.");
      }

      if (button.dataset.action === "save") {
        toggleArrayValue(state.savedIds, id);
        showToast(state.savedIds.includes(id) ? "Post salvo." : "Post removido dos salvos.");
      }

      if (button.dataset.action === "comment") {
        const panel = postElement.querySelector<HTMLElement>(".comments-panel");
        if (panel) panel.hidden = !panel.hidden;
      } else {
        saveState();
        renderAll();
      }
    });
  });

  scope.querySelectorAll<HTMLFormElement>(".comment-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const postElement = form.closest<HTMLElement>(".post");
      const input = form.querySelector<HTMLInputElement>("input");
      const id = postElement?.dataset.id;
      const text = input?.value.trim();
      if (!id || !text) return;

      const post = state.posts.find((item) => item.id === id);
      post?.comments.push({
        id: crypto.randomUUID(),
        author: state.profile.displayName,
        text,
      });
      saveState();
      showToast("Comentario publicado.");
      renderAll();
    });
  });
}

function renderChat(): void {
  chatMessages.innerHTML = state.chat
    .map(
      (message) => `
        <div class="message">
          <div class="avatar">${escapeHtml(message.name[0] ?? "?")}</div>
          <div class="bubble">
            <strong>${escapeHtml(message.name)} <small>${timeAgo(message.createdAt)}</small></strong>
            <p>${escapeHtml(message.text)}</p>
          </div>
        </div>
      `,
    )
    .join("");
  chatMessages.scrollTop = chatMessages.scrollHeight;
  getElement<HTMLSpanElement>("#onlinePill").textContent = `${121 + state.chat.length} online`;
}

function renderTrends(): void {
  const tagCounts = new Map<string, number>();
  state.posts.forEach((post) => post.tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)));
  const trends = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  trendList.innerHTML = trends
    .map(
      ([tag, count]) => `
        <button class="trend" data-search="${escapeHtml(tag)}">
          <span>#${escapeHtml(tag)}</span>
          <strong>${count}</strong>
        </button>
      `,
    )
    .join("");

  trendList.querySelectorAll<HTMLButtonElement>(".trend").forEach((trend) => {
    trend.addEventListener("click", () => {
      searchInput.value = trend.dataset.search ?? "";
      getElement<HTMLButtonElement>('[data-view="feed"]').click();
      renderPosts();
    });
  });
}

function renderMembers(): void {
  const members = uniqueBy(
    state.posts.map((post) => ({ name: post.author, avatar: post.avatar, note: post.mood.toLowerCase() })),
    (member) => member.name,
  ).slice(0, 4);

  memberList.innerHTML = members
    .map(
      (member, index) => `
        <div class="member">
          <span class="avatar member-${index}">${escapeHtml(member.avatar)}</span>
          <div><strong>${escapeHtml(member.name)}</strong><small>${escapeHtml(member.note)} agora</small></div>
        </div>
      `,
    )
    .join("");
}

function renderProfile(): void {
  const ownPosts = state.posts.filter((post) => post.handle === state.profile.handle);
  const receivedLikes = ownPosts.reduce((total, post) => total + post.likes + (state.likedIds.includes(post.id) ? 1 : 0), 0);

  getElement<HTMLDivElement>("#composerAvatar").textContent = state.profile.avatar;
  getElement<HTMLDivElement>("#profileAvatar").textContent = state.profile.avatar;
  getElement<HTMLHeadingElement>("#profileName").textContent = state.profile.displayName;
  getElement<HTMLParagraphElement>("#profileHandle").textContent = `${state.profile.handle} - membro beta`;
  getElement<HTMLElement>("#profilePostCount").textContent = String(ownPosts.length);
  getElement<HTMLElement>("#profileLikeCount").textContent = String(receivedLikes);
  getElement<HTMLElement>("#profileSavedCount").textContent = String(state.savedIds.length);
  displayNameInput.value = state.profile.displayName;
  handleInput.value = state.profile.handle;
  bioInput.value = state.profile.bio;
}

function updateComposer(): void {
  charCount.textContent = `${postText.value.length}/280`;
  document.querySelectorAll<HTMLButtonElement>(".mood").forEach((button) => {
    button.classList.toggle("active", button.dataset.mood === state.selectedMood);
  });
}

function updateCommunityPulse(): void {
  const score = Math.min(100, Math.round((state.posts.length * 12 + state.chat.length * 8 + state.savedIds.length * 6) / 2));
  getElement<HTMLElement>("#healthScore").textContent = `${score}%`;
}

function toggleArrayValue(values: string[], value: string): void {
  const index = values.indexOf(value);
  if (index >= 0) {
    values.splice(index, 1);
  } else {
    values.push(value);
  }
}

function publishPost(): void {
  const text = postText.value.trim();
  if (!text) {
    postText.focus();
    return;
  }

  const tags = [...text.matchAll(/#([\p{L}\d_-]+)/gu)].map((match) => match[1]).slice(0, 4);
  state.posts.unshift({
    id: crypto.randomUUID(),
    author: state.profile.displayName,
    handle: state.profile.handle,
    avatar: state.profile.avatar,
    text,
    tags: tags.length ? tags : [state.selectedMood.toLowerCase()],
    likes: 0,
    featured: false,
    mood: state.selectedMood,
    createdAt: new Date().toISOString(),
    comments: [],
  });

  postText.value = "";
  state.activeFilter = "all";
  document.querySelectorAll<HTMLButtonElement>(".chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.filter === "all");
  });
  saveState();
  showToast("Post publicado no feed global.");
  renderAll();
}

function showToast(message: string): void {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1800);
}

function emptyMessage(message: string): string {
  return `<div class="empty-card">${escapeHtml(message)}</div>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[char] ?? char;
  });
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

function uniqueBy<T>(items: T[], getKey: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

document.querySelectorAll<HTMLButtonElement>(".nav-item").forEach((item) => {
  item.addEventListener("click", () => {
    const viewName = item.dataset.view as ViewName | undefined;
    if (!viewName) return;

    document.querySelectorAll(".nav-item").forEach((nav) => nav.classList.remove("active"));
    document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
    item.classList.add("active");
    getElement(`#${viewName}View`).classList.add("active");
  });
});

document.querySelectorAll<HTMLButtonElement>(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const nextFilter = chip.dataset.filter as FeedFilter | undefined;
    if (!nextFilter) return;

    document.querySelectorAll(".chip").forEach((item) => item.classList.remove("active"));
    chip.classList.add("active");
    state.activeFilter = nextFilter;
    saveState();
    renderPosts();
  });
});

document.querySelectorAll<HTMLButtonElement>(".tag-row button").forEach((button) => {
  button.addEventListener("click", () => {
    const tagName = button.dataset.tag;
    if (!tagName) return;

    const tag = ` #${tagName}`;
    postText.value = postText.value.includes(tag) ? postText.value : `${postText.value}${tag}`;
    updateComposer();
    postText.focus();
  });
});

document.querySelectorAll<HTMLButtonElement>(".mood").forEach((button) => {
  button.addEventListener("click", () => {
    const mood = button.dataset.mood as PostMood | undefined;
    if (!mood) return;

    state.selectedMood = mood;
    saveState();
    updateComposer();
  });
});

getElement<HTMLButtonElement>("#publishPost").addEventListener("click", publishPost);

getElement<HTMLButtonElement>("#focusComposer").addEventListener("click", () => {
  getElement<HTMLButtonElement>('[data-view="feed"]').click();
  postText.focus();
});

getElement<HTMLButtonElement>("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

searchInput.addEventListener("input", renderPosts);
postText.addEventListener("input", updateComposer);

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  state.chat.push({
    id: crypto.randomUUID(),
    name: state.profile.displayName,
    text,
    createdAt: new Date().toISOString(),
  });
  chatInput.value = "";
  saveState();
  renderChat();
  showToast("Mensagem enviada no chat global.");
});

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const displayName = displayNameInput.value.trim() || defaultProfile.displayName;
  const handle = handleInput.value.trim().replace(/^@?/, "@") || defaultProfile.handle;

  state.profile = {
    displayName,
    handle,
    bio: bioInput.value.trim(),
    avatar: displayName[0]?.toUpperCase() ?? "F",
  };
  saveState();
  renderAll();
  showToast("Perfil salvo.");
});

renderAll();
