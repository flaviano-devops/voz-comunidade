import "./styles.css";

type ViewName = "feed" | "chat" | "profile" | "saved";
type FeedFilter = "all" | "featured" | "following" | "new";

interface Post {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  text: string;
  tags: string[];
  likes: number;
  comments: number;
  featured: boolean;
  image?: boolean;
}

type ChatMessage = [name: string, text: string];

const posts: Post[] = [
  {
    id: crypto.randomUUID(),
    author: "Lia",
    handle: "@liart",
    avatar: "L",
    text: "Terminei um estudo de personagem e queria um lugar simples para postar sem escolher comunidade. Esse feed unico resolve muito.",
    tags: ["arte", "personagem"],
    likes: 42,
    comments: 8,
    featured: true,
    image: true,
  },
  {
    id: crypto.randomUUID(),
    author: "Mateus",
    handle: "@mestre",
    avatar: "M",
    text: "Ideia para o app: deixar as tags substituirem comunidades no inicio. Depois, quando tiver massa critica, comunidades podem nascer dos assuntos mais usados.",
    tags: ["rpg", "produto"],
    likes: 31,
    comments: 12,
    featured: true,
  },
  {
    id: crypto.randomUUID(),
    author: "Nina",
    handle: "@ninasama",
    avatar: "N",
    text: "Sinto falta de uma rede menor, mais de conversa, menos performance. Feed global + moderacao boa ja seria um comeco forte.",
    tags: ["anime", "off"],
    likes: 27,
    comments: 5,
    featured: false,
  },
];

const chatSeed: ChatMessage[] = [
  ["Lia", "Alguem testando o feed novo?"],
  ["Mateus", "Sim. A vibe comunidade unica ficou boa para o MVP."],
  ["Nina", "Quero abas de eventos depois."],
];

let activeFilter: FeedFilter = "all";
const savedIds = new Set<string>();
const likedIds = new Set<string>();

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
          <small>Sem divisao por temas ainda</small>
        </div>
      </div>
    </aside>

    <main class="main-panel">
      <header class="topbar">
        <label class="search-wrap">
          <span aria-hidden="true">⌕</span>
          <input id="searchInput" type="search" placeholder="Buscar posts, pessoas e tags" />
        </label>
        <button class="icon-btn" id="themeToggle" title="Alternar tema" aria-label="Alternar tema">◐</button>
        <button class="primary-btn" id="focusComposer">Publicar</button>
      </header>

      <section class="content-grid">
        <section class="feed-column view active" id="feedView">
          <div class="composer" id="composer">
            <div class="avatar me">F</div>
            <div class="composer-body">
              <textarea id="postText" maxlength="280" placeholder="Compartilhe algo com a comunidade"></textarea>
              <div class="composer-actions">
                <div class="tag-row" role="list" aria-label="Tags rapidas">
                  <button data-tag="arte">Arte</button>
                  <button data-tag="rpg">RPG</button>
                  <button data-tag="anime">Anime</button>
                  <button data-tag="off">Off</button>
                </div>
                <button class="primary-btn" id="publishPost">Enviar</button>
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
            <span class="online-pill">128 online</span>
          </div>
          <div class="chat-window" id="chatMessages"></div>
          <form class="chat-form" id="chatForm">
            <input id="chatInput" type="text" maxlength="160" placeholder="Escreva uma mensagem" autocomplete="off" />
            <button class="primary-btn" type="submit">Enviar</button>
          </form>
        </section>

        <section class="profile-column view" id="profileView">
          <div class="profile-hero">
            <div class="avatar profile-avatar">F</div>
            <div>
              <h1>Flaviano</h1>
              <p>@fundador · membro beta</p>
            </div>
          </div>
          <div class="stats-grid">
            <div><strong>12</strong><span>posts</span></div>
            <div><strong>248</strong><span>curtidas</span></div>
            <div><strong>37</strong><span>salvos</span></div>
          </div>
          <div class="settings-panel">
            <h2>Identidade</h2>
            <label>Nome exibido<input value="Flaviano" /></label>
            <label>Bio<textarea>Construindo uma comunidade universal.</textarea></label>
            <button class="primary-btn">Salvar perfil</button>
          </div>
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
            <button class="trend" data-search="rpg"><span>#rpg</span><strong>2.4k</strong></button>
            <button class="trend" data-search="arte"><span>#arte</span><strong>1.8k</strong></button>
            <button class="trend" data-search="anime"><span>#anime</span><strong>1.1k</strong></button>
          </section>

          <section class="rail-section">
            <h2>Membros ativos</h2>
            <div class="member"><span class="avatar a">L</span><div><strong>Lia</strong><small>desenhando agora</small></div></div>
            <div class="member"><span class="avatar b">M</span><div><strong>Mateus</strong><small>mestrando RPG</small></div></div>
            <div class="member"><span class="avatar c">N</span><div><strong>Nina</strong><small>comentando teorias</small></div></div>
          </section>

          <section class="rail-section rules">
            <h2>Regras</h2>
            <p>Respeito primeiro. Conteudo criativo e conversa leve tem prioridade.</p>
          </section>
        </aside>
      </section>
    </main>
  </div>
`;

const postList = getElement<HTMLDivElement>("#postList");
const savedList = getElement<HTMLDivElement>("#savedList");
const searchInput = getElement<HTMLInputElement>("#searchInput");
const postText = getElement<HTMLTextAreaElement>("#postText");
const chatMessages = getElement<HTMLDivElement>("#chatMessages");
const chatForm = getElement<HTMLFormElement>("#chatForm");
const chatInput = getElement<HTMLInputElement>("#chatInput");

function getElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Elemento ${selector} nao encontrado.`);
  }
  return element;
}

function renderPosts(): void {
  const query = searchInput.value.trim().toLowerCase();
  const visiblePosts = posts.filter((post) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "featured" && post.featured) ||
      activeFilter === "following" ||
      activeFilter === "new";
    const content = `${post.author} ${post.handle} ${post.text} ${post.tags.join(" ")}`.toLowerCase();
    return matchesFilter && content.includes(query);
  });

  postList.innerHTML = visiblePosts.map(postTemplate).join("");
  bindPostActions(postList);
  renderSaved();
}

function renderSaved(): void {
  const savedPosts = posts.filter((post) => savedIds.has(post.id));
  savedList.innerHTML = savedPosts.map(postTemplate).join("");
  bindPostActions(savedList);
}

function postTemplate(post: Post): string {
  const isLiked = likedIds.has(post.id);
  const isSaved = savedIds.has(post.id);
  return `
    <article class="post" data-id="${post.id}">
      <div class="post-head">
        <div class="avatar">${post.avatar}</div>
        <div class="post-meta">
          <strong>${escapeHtml(post.author)}</strong>
          <small>${escapeHtml(post.handle)} · agora na comunidade</small>
        </div>
      </div>
      <p>${escapeHtml(post.text)}</p>
      ${post.image ? '<div class="post-image" role="img" aria-label="Imagem conceitual da comunidade"></div>' : ""}
      <div class="post-tags">${post.tags.map((tag) => `<span>#${escapeHtml(tag)}</span>`).join("")}</div>
      <div class="post-actions">
        <button class="action-btn ${isLiked ? "active" : ""}" data-action="like">${isLiked ? "Curtido" : "Curtir"} · ${post.likes + (isLiked ? 1 : 0)}</button>
        <button class="action-btn" data-action="comment">Comentar · ${post.comments}</button>
        <button class="action-btn ${isSaved ? "active" : ""}" data-action="save">${isSaved ? "Salvo" : "Salvar"}</button>
      </div>
    </article>
  `;
}

function bindPostActions(scope: HTMLElement): void {
  scope.querySelectorAll<HTMLButtonElement>(".action-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const post = button.closest<HTMLElement>(".post");
      const id = post?.dataset.id;
      if (!id) return;

      if (button.dataset.action === "like") toggleSet(likedIds, id);
      if (button.dataset.action === "save") toggleSet(savedIds, id);
      if (button.dataset.action === "comment") window.alert("Comentarios entram na proxima iteracao.");
      renderPosts();
    });
  });
}

function toggleSet(set: Set<string>, value: string): void {
  if (set.has(value)) {
    set.delete(value);
  } else {
    set.add(value);
  }
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
    activeFilter = nextFilter;
    renderPosts();
  });
});

document.querySelectorAll<HTMLButtonElement>(".tag-row button").forEach((button) => {
  button.addEventListener("click", () => {
    const tagName = button.dataset.tag;
    if (!tagName) return;

    const tag = ` #${tagName}`;
    postText.value = postText.value.includes(tag) ? postText.value : `${postText.value}${tag}`;
    postText.focus();
  });
});

document.querySelectorAll<HTMLButtonElement>(".trend").forEach((trend) => {
  trend.addEventListener("click", () => {
    searchInput.value = trend.dataset.search ?? "";
    getElement<HTMLButtonElement>('[data-view="feed"]').click();
    renderPosts();
  });
});

getElement<HTMLButtonElement>("#publishPost").addEventListener("click", () => {
  const text = postText.value.trim();
  if (!text) {
    postText.focus();
    return;
  }

  const tags = [...text.matchAll(/#([\p{L}\d_-]+)/gu)].map((match) => match[1]).slice(0, 4);
  posts.unshift({
    id: crypto.randomUUID(),
    author: "Flaviano",
    handle: "@fundador",
    avatar: "F",
    text,
    tags: tags.length ? tags : ["geral"],
    likes: 0,
    comments: 0,
    featured: false,
  });

  postText.value = "";
  activeFilter = "all";
  document.querySelectorAll<HTMLButtonElement>(".chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.filter === "all");
  });
  renderPosts();
});

getElement<HTMLButtonElement>("#focusComposer").addEventListener("click", () => {
  getElement<HTMLButtonElement>('[data-view="feed"]').click();
  postText.focus();
});

getElement<HTMLButtonElement>("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

searchInput.addEventListener("input", renderPosts);

function renderChat(): void {
  chatMessages.innerHTML = chatSeed
    .map(
      ([name, text]) => `
        <div class="message">
          <div class="avatar">${name[0] ?? "?"}</div>
          <div class="bubble">
            <strong>${escapeHtml(name)}</strong>
            <p>${escapeHtml(text)}</p>
          </div>
        </div>
      `,
    )
    .join("");
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  chatSeed.push(["Flaviano", text]);
  chatInput.value = "";
  renderChat();
});

renderPosts();
renderChat();
