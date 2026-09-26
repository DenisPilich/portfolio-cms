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
 *
 * Пароль администратора берётся из переменной окружения ADMIN_PASSWORD,
 * иначе из файла .env. Значение по умолчанию подходит только для чистой
 * базы сразу после сида — если пароль меняли, впишите свой в .env:
 *   ADMIN_PASSWORD="ваш_пароль"
 */

import "dotenv/config";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const EMAIL = process.env.ADMIN_EMAIL ?? "admin@example.com";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "admin12345";

const TEST_SLUG = "e2e-test-project";
const TEST_TITLE = "Проект для проверки";
const UPDATED_TITLE = "Проект для проверки (изменён)";
const TEST_SKILL_NAME = "Навык для проверки";

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
 * Находит идентификатор записи по её названию.
 *
 * У навыков нет slug, поэтому общий extractRecordIds не подходит: ищем
 * в пределах одного элемента списка, где рядом с названием лежит скрытое
 * поле с идентификатором.
 */
function findIdByName(html, name) {
  const withoutComments = html.replace(/<!--[\s\S]*?-->/g, "");

  for (const chunk of withoutComments.split("<li")) {
    if (chunk.includes(name)) {
      const id = /name="id" value="([^"]+)"/.exec(chunk)?.[1];

      if (id) {
        return id;
      }
    }
  }

  return null;
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

  return Boolean(projectId);
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
  for (const path of ["/admin", "/admin/projects", "/admin/skills"]) {
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

  section("8. Поиск");
  const searchFound = await get(`/search?q=${encodeURIComponent("Prisma")}`);
  check(
    "поиск находит проект по названию стека",
    searchFound.text.includes("Портфолио с собственной CMS"),
  );

  const searchByTitle = await get(`/search?q=${encodeURIComponent("планировщик")}`);
  check(
    "поиск находит проект по названию",
    searchByTitle.text.includes("Планировщик задач"),
  );

  const searchEmpty = await get(`/search?q=${encodeURIComponent("ъъъъъъ")}`);
  check(
    "пустой результат объясняется",
    searchEmpty.text.includes("ничего не нашлось"),
  );

  const searchShort = await get("/search?q=к");
  check(
    "слишком короткий запрос подсказывает минимум",
    searchShort.text.includes("Введите хотя бы"),
  );

  section("9. Загрузка обложек");
  // Минимальный PNG-заголовок: содержимое неважно, проверяем доступ.
  const pngBytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

  const anonymousForm = new FormData();
  anonymousForm.append(
    "file",
    new File([pngBytes], "cover.png", { type: "image/png" }),
  );
  const anonymousUpload = await request("/api/upload", {
    method: "POST",
    body: anonymousForm,
  });
  check(
    "без сессии загрузка запрещена",
    anonymousUpload.response.status === 401,
    `статус ${anonymousUpload.response.status}`,
  );

  const authorizedForm = new FormData();
  authorizedForm.append(
    "file",
    new File([pngBytes], "cover.png", { type: "image/png" }),
  );
  const authorizedUpload = await request("/api/upload", {
    method: "POST",
    body: authorizedForm,
    headers: { cookie },
  });
  // Код 503 означает, что дело дошло до проверки хранилища, а не отбилось
  // на авторизации: токен Vercel Blob в этом окружении не задан.
  check(
    "с сессией запрос доходит до хранилища",
    authorizedUpload.response.status === 200 ||
      authorizedUpload.response.status === 503,
    `статус ${authorizedUpload.response.status}`,
  );

  const rejectedForm = new FormData();
  rejectedForm.append(
    "file",
    new File([new Uint8Array([1, 2, 3])], "note.txt", { type: "text/plain" }),
  );
  const rejectedUpload = await request("/api/upload", {
    method: "POST",
    body: rejectedForm,
    headers: { cookie },
  });
  check(
    "неподдерживаемый тип файла отклонён",
    rejectedUpload.response.status === 415,
    `статус ${rejectedUpload.response.status}`,
  );

  section("10. Навыки");
  let skillsHtml = (await get("/admin/skills", cookie)).text;
  check("раздел навыков открывается", skillsHtml.includes("Hard skills"));

  // Убираем навык от прошлого запуска: уникального поля у навыка нет,
  // поэтому повторное создание не упало бы, а просто наплодило дублей.
  const staleSkillId = findIdByName(skillsHtml, TEST_SKILL_NAME);
  if (staleSkillId) {
    const staleFields = extractHiddenFields(skillsHtml);
    staleFields.set("id", staleSkillId);
    await postForm("/admin/skills", staleFields, cookie);
  }

  const newSkillPage = await get("/admin/skills/new", cookie);
  const skillFields = extractHiddenFields(newSkillPage.text);
  skillFields.set("name", TEST_SKILL_NAME);
  skillFields.set("description", "Навык, созданный автоматической проверкой.");
  skillFields.set("category", "SOFT");
  skillFields.set("level", "BASIC");
  skillFields.set("icon", "");
  skillFields.set("position", "99");

  const createdSkill = await postForm("/admin/skills/new", skillFields, cookie);
  check(
    "навык создан",
    createdSkill.response.status < 400,
    `статус ${createdSkill.response.status}`,
  );

  const homeWithSkill = await get("/");
  check(
    "навык появился на главной",
    homeWithSkill.text.includes(TEST_SKILL_NAME),
  );

  skillsHtml = (await get("/admin/skills", cookie)).text;
  const skillId = findIdByName(skillsHtml, TEST_SKILL_NAME);
  check("навык виден в списке", Boolean(skillId));

  if (skillId) {
    const deleteSkillFields = extractHiddenFields(skillsHtml);
    deleteSkillFields.set("id", skillId);
    await postForm("/admin/skills", deleteSkillFields, cookie);

    const homeAfterDelete = await get("/");
    check(
      "навык удалён и пропал с главной",
      !homeAfterDelete.text.includes(TEST_SKILL_NAME),
    );
  }

  section("11. Форма обратной связи");
  const contactPage = await get("/contact");
  check("страница контактов открывается", contactPage.response.status === 200);
  check(
    "форма содержит нужные поля",
    contactPage.text.includes('name="message"') &&
      contactPage.text.includes('name="email"'),
  );
  check(
    "ловушка для ботов скрыта в разметке",
    contactPage.text.includes('name="company"'),
  );

  const contactFields = extractHiddenFields(contactPage.text);
  contactFields.set("name", "Проверка формы");
  contactFields.set("email", "e2e-check@example.com");
  contactFields.set("message", "Сообщение от автоматической проверки.");
  contactFields.set("company", "");

  const submitted = await postForm("/contact", contactFields);
  check(
    "сообщение принято",
    submitted.response.status < 400,
    `статус ${submitted.response.status}`,
  );
  check(
    "показано подтверждение",
    submitted.text.includes("Сообщение отправлено"),
  );

  const messagesPage = await get("/admin/messages", cookie);
  check(
    "сообщение видно в админке",
    messagesPage.text.includes("e2e-check@example.com"),
  );

  // Ловушка: бот заполняет скрытое поле — сообщение сохраняться не должно,
  // но ответ ему уходит такой же, как человеку.
  const botFields = extractHiddenFields(contactPage.text);
  botFields.set("name", "Бот");
  botFields.set("email", "bot@example.com");
  botFields.set("message", "Это спам-сообщение от автоматического сборщика.");
  botFields.set("company", "Спам-фирма");

  await postForm("/contact", botFields);
  const messagesAfterBot = await get("/admin/messages", cookie);
  check(
    "ловушка отсекает бота",
    !messagesAfterBot.text.includes("bot@example.com"),
  );

  // Убираем за собой, иначе тест будет копить сообщения
  const messageId = findIdByName(
    messagesAfterBot.text,
    "e2e-check@example.com",
  );
  if (messageId) {
    const deleteMessageFields = extractHiddenFields(messagesAfterBot.text);
    deleteMessageFields.set("id", messageId);
    await postForm("/admin/messages", deleteMessageFields, cookie);

    const messagesAfterCleanup = await get("/admin/messages", cookie);
    check(
      "тестовое сообщение удалено",
      !messagesAfterCleanup.text.includes("e2e-check@example.com"),
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
