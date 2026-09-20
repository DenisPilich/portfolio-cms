/**
 * Интеграционная проверка админки.
 *
 * Прогоняет реальные сценарии по HTTP, без браузера: защиту маршрутов,
 * вход с неверным и верным паролем, а затем полный цикл CRUD —
 * создание проекта, правку, удаление и проверку, что изменения видны
 * на публичной части сайта.
 *
 * Формы отправляются так же, как их отправил бы браузер без JavaScript:
 * обычным POST с multipart/form-data и скрытыми полями серверного действия.
 *
 * Запуск (сервер должен быть поднят):
 *   node scripts/test-admin.mjs
 */

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const EMAIL = process.env.ADMIN_EMAIL ?? "admin@example.com";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "admin12345";

const TEST_SLUG = "e2e-test-project";
const TEST_TITLE = "Проект для проверки";
const UPDATED_TITLE = "Проект для проверки (изменён)";
const TEST_POST_SLUG = "e2e-test-post";

let failures = 0;

function check(label, condition, detail = "") {
  if (!condition) {
    failures += 1;
  }
  console.log(`${condition ? "OK  " : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
}

function section(title) {
  console.log(`\n${title}`);
}

/**
 * Значения скрытых полей в разметке экранированы (&quot; вместо кавычки),
 * а браузер при отправке формы подставляет их раскодированными.
 * Без этого шага сервер не разберёт JSON с идентификатором действия
 * и ответит «Failed to find Server Action».
 */
function decodeHtmlEntities(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function extractHiddenFields(html) {
  const fields = new Map();

  for (const match of html.matchAll(/<input[^>]*type="hidden"[^>]*>/g)) {
    const tag = match[0];
    const name = /name="([^"]*)"/.exec(tag)?.[1];
    const value = /value="([^"]*)"/.exec(tag)?.[1] ?? "";

    if (name) {
      fields.set(name, decodeHtmlEntities(value));
    }
  }

  return fields;
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    redirect: "manual",
    ...options,
  });

  return { response, text: await response.text() };
}

async function get(path, cookie) {
  return request(path, { headers: cookie ? { cookie } : {} });
}

async function postForm(path, fields, cookie) {
  const form = new FormData();

  for (const [name, value] of fields) {
    form.append(name, value);
  }

  return request(path, {
    method: "POST",
    body: form,
    headers: cookie ? { cookie } : {},
  });
}

function sessionCookieFrom(response) {
  const cookies = response.headers.getSetCookie?.() ?? [];
  const raw = cookies.find((item) => item.startsWith("portfolio_session="));

  if (!raw) {
    return null;
  }

  return { header: raw.split(";")[0], raw };
}

/**
 * Достаёт идентификаторы записей из списка админки вместе с их slug.
 *
 * React при серверном рендеринге разделяет соседние текстовые узлы
 * комментариями вида <!-- -->, поэтому перед разбором их нужно убрать —
 * иначе «/slug» в разметке выглядит как «/<!-- -->slug».
 */
function extractRecordIds(html, resource) {
  const result = new Map();
  const withoutComments = html.replace(/<!--[\s\S]*?-->/g, "");

  for (const chunk of withoutComments.split("<li")) {
    const id = new RegExp(`/admin/${resource}/([^/"]+)/edit`).exec(chunk)?.[1];
    const slug = /font-mono[^>]*>\s*\/([a-z0-9-]+)/.exec(chunk)?.[1];

    if (id && slug) {
      result.set(slug, id);
    }
  }

  return result;
}

/**
 * Удаляет записи, оставшиеся от предыдущего запуска.
 * Без этого повторный прогон упёрся бы в занятый slug.
 */
async function cleanupTestRecords(cookie) {
  const projectList = await get("/admin/projects", cookie);
  const projectId = extractRecordIds(projectList.text, "projects").get(
    TEST_SLUG,
  );

  if (projectId) {
    const fields = extractHiddenFields(projectList.text);
    fields.set("id", projectId);
    fields.set("slug", TEST_SLUG);
    await postForm("/admin/projects", fields, cookie);
  }

  const postList = await get("/admin/posts", cookie);
  const postId = extractRecordIds(postList.text, "posts").get(TEST_POST_SLUG);

  if (postId) {
    const fields = extractHiddenFields(postList.text);
    fields.set("id", postId);
    fields.set("slug", TEST_POST_SLUG);
    await postForm("/admin/posts", fields, cookie);
  }

  return Boolean(projectId) || Boolean(postId);
}

async function login() {
  const page = await get("/login");
  const fields = extractHiddenFields(page.text);
  fields.set("email", EMAIL);
  fields.set("password", PASSWORD);

  const result = await postForm("/login", fields);
  const session = sessionCookieFrom(result.response);

  return session?.header ?? null;
}

async function main() {
  console.log(`Проверяю ${BASE_URL}`);

  section("1. Доступ к админке без сессии");
  for (const path of ["/admin", "/admin/projects", "/admin/posts"]) {
    const { response } = await get(path);
    check(
      `${path} не отдаётся без входа`,
      response.status === 307 || response.status === 308,
      `статус ${response.status}`,
    );
  }

  section("2. Отказ при неверном пароле");
  const loginPage = await get("/login");
  const badFields = extractHiddenFields(loginPage.text);
  badFields.set("email", EMAIL);
  badFields.set("password", "definitely-not-the-password");
  const badLogin = await postForm("/login", badFields);
  check("сессия не выдана", sessionCookieFrom(badLogin.response) === null);
  check(
    "показано сообщение об ошибке",
    badLogin.text.includes("Неверный email или пароль"),
  );

  section("3. Вход с верным паролем");
  const cookie = await login();
  check("сессия выдана", cookie !== null);
  if (!cookie) {
    console.log("\nБез сессии продолжать нельзя.");
    process.exit(1);
  }

  section("3.1. Очистка записей от прошлых запусков");
  const cleanedUp = await cleanupTestRecords(cookie);
  console.log(
    cleanedUp ? "     удалены записи предыдущего запуска" : "     удалять нечего",
  );

  section("4. Создание проекта");
  const newPage = await get("/admin/projects/new", cookie);
  const createFields = extractHiddenFields(newPage.text);
  createFields.set("title", TEST_TITLE);
  createFields.set("slug", TEST_SLUG);
  createFields.set("summary", "Проект, созданный автоматической проверкой.");
  createFields.set("content", "## Проверка\n\nЭтот проект создан интеграционным тестом.");
  createFields.set("techStack", "Next.js, Prisma");
  createFields.set("repoUrl", "");
  createFields.set("liveUrl", "");
  createFields.set("position", "0");
  createFields.set("published", "on");

  const created = await postForm("/admin/projects/new", createFields, cookie);
  const createdLocation = created.response.headers.get("location");
  check(
    "после сохранения происходит переход",
    created.response.status === 303 || created.response.status === 200,
    `статус ${created.response.status}, location ${createdLocation}`,
  );

  const listAfterCreate = await get("/admin/projects", cookie);
  check("проект появился в списке", listAfterCreate.text.includes(TEST_TITLE));

  const publicProject = await get(`/projects/${TEST_SLUG}`);
  check(
    "проект открывается на публичной странице",
    publicProject.response.status === 200,
    `статус ${publicProject.response.status}`,
  );
  check(
    "на публичной странице видно технологии",
    publicProject.text.includes("Prisma"),
  );

  section("5. Редактирование проекта");
  const projectIds = extractRecordIds(listAfterCreate.text, "projects");
  const projectId = projectIds.get(TEST_SLUG);
  check("идентификатор проекта найден", Boolean(projectId), projectId ?? "");

  if (projectId) {
    const editPage = await get(`/admin/projects/${projectId}/edit`, cookie);
    check(
      "форма редактирования открывается",
      editPage.response.status === 200,
    );
    check(
      "форма заполнена текущими данными",
      editPage.text.includes(TEST_TITLE),
    );

    const editFields = extractHiddenFields(editPage.text);
    editFields.set("id", projectId);
    editFields.set("title", UPDATED_TITLE);
    editFields.set("slug", TEST_SLUG);
    editFields.set("summary", "Описание обновлено автоматической проверкой.");
    editFields.set("content", "## Проверка\n\nСодержимое обновлено.");
    editFields.set("techStack", "Next.js");
    editFields.set("repoUrl", "");
    editFields.set("liveUrl", "");
    editFields.set("position", "0");
    editFields.set("published", "on");

    await postForm(`/admin/projects/${projectId}/edit`, editFields, cookie);

    const listAfterUpdate = await get("/admin/projects", cookie);
    check(
      "изменения сохранены",
      listAfterUpdate.text.includes(UPDATED_TITLE),
    );

    // Ключевая проверка инвалидации кэша: страница на сайте собрана
    // статически, и без сброса тега здесь осталась бы старая версия.
    const publicAfterUpdate = await get(`/projects/${TEST_SLUG}`);
    check(
      "публичная страница обновилась сразу после правки",
      publicAfterUpdate.text.includes(UPDATED_TITLE),
      `статус ${publicAfterUpdate.response.status}`,
    );
  }

  section("6. Статья с тегами");
  const newPostPage = await get("/admin/posts/new", cookie);
  const postFields = extractHiddenFields(newPostPage.text);
  postFields.set("title", "Статья для проверки");
  postFields.set("slug", TEST_POST_SLUG);
  postFields.set("excerpt", "Статья, созданная автоматической проверкой.");
  postFields.set(
    "content",
    "## Раздел\n\nТекст статьи, созданной интеграционным тестом для проверки тегов.",
  );
  postFields.set("coverImage", "");
  postFields.set("tags", "E2E-проверка, Next.js");
  postFields.set("published", "on");

  await postForm("/admin/posts/new", postFields, cookie);

  const publicPost = await get(`/blog/${TEST_POST_SLUG}`);
  check(
    "статья открывается на публичной странице",
    publicPost.response.status === 200,
    `статус ${publicPost.response.status}`,
  );
  check(
    "время чтения рассчитано",
    publicPost.text.includes("мин чтения"),
  );
  check(
    "тег создан автоматически",
    publicPost.text.includes("E2E-проверка"),
  );

  section("7. Удаление созданных записей");
  const listBeforeDelete = await get("/admin/projects", cookie);
  const deleteFields = extractHiddenFields(listBeforeDelete.text);
  const idForDelete = extractRecordIds(listBeforeDelete.text, "projects").get(
    TEST_SLUG,
  );

  if (idForDelete) {
    deleteFields.set("id", idForDelete);
    deleteFields.set("slug", TEST_SLUG);
    await postForm("/admin/projects", deleteFields, cookie);

    const listAfterDelete = await get("/admin/projects", cookie);
    check(
      "проект удалён",
      !listAfterDelete.text.includes(UPDATED_TITLE),
    );

    const gonePage = await get(`/projects/${TEST_SLUG}`);
    check(
      "удалённый проект больше не открывается",
      gonePage.response.status === 404,
      `статус ${gonePage.response.status}`,
    );
  }

  const postList = await get("/admin/posts", cookie);
  const postDeleteFields = extractHiddenFields(postList.text);
  const postId = extractRecordIds(postList.text, "posts").get(TEST_POST_SLUG);

  if (postId) {
    postDeleteFields.set("id", postId);
    postDeleteFields.set("slug", TEST_POST_SLUG);
    await postForm("/admin/posts", postDeleteFields, cookie);

    const publicPostAfter = await get(`/blog/${TEST_POST_SLUG}`);
    check(
      "статья удалена",
      publicPostAfter.response.status === 404,
      `статус ${publicPostAfter.response.status}`,
    );
  }

  console.log(
    failures === 0
      ? "\nВсе проверки пройдены."
      : `\nПровалено проверок: ${failures}`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error("Ошибка выполнения проверки:", error);
  process.exit(1);
});
