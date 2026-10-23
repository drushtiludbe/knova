
const sampleResources = [
  {
    title: "Python Documentation",
    description: "Official documentation and guides for learning Python.",
    author: "Python Software Foundation",
    source: "docs.python.org",
    url: "https://docs.python.org/3/",
    type: "Documentation",
    field: "documentation",
    domain: "Computer Science",
    subdomain: "Programming",
    keywords: "python programming coding language documentation"
  },
  {
    title: "MDN JavaScript Guide",
    description: "A guide to JavaScript concepts, syntax and language features.",
    author: "MDN contributors",
    source: "developer.mozilla.org",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
    type: "Guide",
    field: "documentation",
    domain: "Computer Science",
    subdomain: "Web Development",
    keywords: "javascript programming web development html css guide"
  },
  {
    title: "GitHub Skills",
    description: "Interactive lessons for learning GitHub workflows.",
    author: "GitHub",
    source: "skills.github.com",
    url: "https://skills.github.com/",
    type: "Learning resource",
    field: "documentation",
    domain: "Computer Science",
    subdomain: "Programming",
    keywords: "github git coding programming beginner learning"
  },
  {
    title: "Google Scholar",
    description: "Search scholarly literature across many disciplines.",
    author: "Google",
    source: "scholar.google.com",
    url: "https://scholar.google.com/",
    type: "Research search",
    field: "web",
    domain: "Computer Science",
    subdomain: "Research",
    keywords: "research paper academic scholar science computer science"
  }
];

document.addEventListener("DOMContentLoaded", () => {

  // GENERAL RESOURCE CARD
  function createResourceCard(resource) {
    const card = document.createElement("article");
    card.className = "result-card";

    const title = document.createElement("h3");
    const link = document.createElement("a");

    link.href = resource.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = resource.title;

    title.appendChild(link);

    const description = document.createElement("p");
    description.textContent = resource.description || "";

    const details = document.createElement("p");
    details.className = "result-details";
    details.textContent = [
      resource.type,
      resource.domain,
      resource.subdomain,
      resource.author,
      resource.source
    ].filter(Boolean).join(" | ");

    card.append(title, description, details);
    return card;
  }

  // SAFE RESULT RENDERING
  function displayResults(resources, container) {
    if (!container) return;
    container.replaceChildren();

    resources.forEach(resource => {
      container.appendChild(createResourceCard(resource));
    });
  }

  function showMessage(container, message) {
    if (!container) return;

    container.replaceChildren();

    const paragraph = document.createElement("p");
    paragraph.textContent = message;
    container.appendChild(paragraph);
  }

  function addLink(card, url, label) {
    if (!url) return;

    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") return;

      const link = document.createElement("a");
      link.href = parsed.href;
      link.textContent = label;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      card.appendChild(link);
    } catch {
      // Ignore invalid links.
    }
  }

  // SEARCH KNOVA'S OWN SAMPLE RESOURCES
  function searchResources(query) {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];

    return sampleResources.filter(resource => {
      const text = [
        resource.title,
        resource.description,
        resource.author,
        resource.source,
        resource.type,
        resource.field,
        resource.domain,
        resource.subdomain,
        resource.keywords
      ].join(" ").toLowerCase();

      return words.every(word => text.includes(word));
    });
  }

  // CROSSREF: ACADEMIC PUBLICATIONS
  async function searchCrossref(query, author) {
    const params = new URLSearchParams({ rows: "10" });

    if (query) params.set("query", query);
    if (author) params.set("query.author", author);

    const response = await fetch(
      `https://api.crossref.org/works?${params}`
    );

    if (!response.ok) {
      throw new Error(`Crossref error: ${response.status}`);
    }

    const data = await response.json();

    return (data.message?.items || []).map(item => {
      const date =
        item["published-print"]?.["date-parts"]?.[0] ||
        item["published-online"]?.["date-parts"]?.[0] ||
        item.published?.["date-parts"]?.[0] ||
        item.created?.["date-parts"]?.[0];

      return {
        title: item.title?.[0] || "Title unavailable",
        authors: (item.author || [])
          .map(a => [a.given, a.family].filter(Boolean).join(" "))
          .filter(Boolean).join(", "),
        year: date?.[0] || "Year unavailable",
        journal: item["container-title"]?.[0] || "",
        doi: item.DOI || "",
        url: item.URL || ""
      };
    });
  }

  function renderResearch(papers, container) {
    container.replaceChildren();

    papers.forEach(paper => {
      const card = document.createElement("article");
      card.className = "result-card";

      const title = document.createElement("h3");
      title.textContent = paper.title;

      const details = document.createElement("p");
      details.className = "result-details";
      details.textContent = [
        paper.authors,
        paper.year,
        paper.journal
      ].filter(Boolean).join(" | ");

      card.append(title, details);
      addLink(
        card,
        paper.doi ? `https://doi.org/${paper.doi}` : paper.url,
        "View publication"
      );

      const source = document.createElement("p");
      source.className = "result-details";
      source.textContent = "Source: Crossref";
      card.appendChild(source);
      container.appendChild(card);
    });
  }

  // OPEN LIBRARY: BOOKS AND BOOK COVERS
  async function searchBooks(query, author) {
    const params = new URLSearchParams({
      limit: "10",
      fields: "key,title,author_name,first_publish_year,cover_i,edition_count"
    });

    if (query) params.set("q", query);
    if (author) params.set("author", author);

    const response = await fetch(
      `https://openlibrary.org/search.json?${params}`
    );

    if (!response.ok) {
      throw new Error(`Open Library error: ${response.status}`);
    }

    const data = await response.json();

    return (data.docs || []).map(book => ({
      title: book.title || "Title unavailable",
      authors: (book.author_name || []).join(", "),
      year: book.first_publish_year || "Year unavailable",
      editions: book.edition_count || 0,
      cover: book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : "",
      url: book.key
        ? `https://openlibrary.org${book.key}`
        : ""
    }));
  }

  function renderBooks(books, container) {
    container.replaceChildren();

    books.forEach(book => {
      const card = document.createElement("article");
      card.className = "result-card";

      if (book.cover) {
        const image = document.createElement("img");
        image.src = book.cover;
        image.alt = `Cover of ${book.title}`;
        image.loading = "lazy";
        image.style.maxWidth = "140px";
        image.style.height = "auto";
        image.style.display = "block";
        image.style.marginBottom = "12px";
        card.appendChild(image);
      }

      const title = document.createElement("h3");
      title.textContent = book.title;

      const details = document.createElement("p");
      details.className = "result-details";
      details.textContent =
        `${book.authors || "Author unavailable"} | ${book.year}`;

      card.append(title, details);

      if (book.editions) {
        const editions = document.createElement("p");
        editions.textContent = `Recorded editions: ${book.editions}`;
        card.appendChild(editions);
      }

      addLink(card, book.url, "View book details");
      container.appendChild(card);
    });
  }

  // WIKIMEDIA COMMONS: PHOTOGRAPHS AND IMAGES
  async function searchPhotos(query, author) {
    const searchTerm = [query, author].filter(Boolean).join(" ");

    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: `filetype:bitmap ${searchTerm}`,
      gsrnamespace: "6",
      gsrlimit: "10",
      prop: "imageinfo",
      iiprop: "url|extmetadata",
      iiurlwidth: "400",
      format: "json",
      origin: "*"
    });

    const response = await fetch(
      `https://commons.wikimedia.org/w/api.php?${params}`
    );

    if (!response.ok) {
      throw new Error(`Wikimedia Commons error: ${response.status}`);
    }

    const data = await response.json();

    return Object.values(data.query?.pages || {}).map(page => {
      const info = page.imageinfo?.[0];
      const metadata = info?.extmetadata || {};

      return {
        title: (page.title || "").replace(/^File:/, ""),
        image: info?.thumburl || info?.url || "",
        pageUrl: info?.descriptionurl || "",
        creator: metadata.Artist?.value || "",
        license: metadata.LicenseShortName?.value || "",
        source: "Wikimedia Commons"
      };
    }).filter(photo => photo.image && photo.pageUrl);
  }

  function renderPhotos(photos, container) {
    container.replaceChildren();

    photos.forEach(photo => {
      const card = document.createElement("article");
      card.className = "result-card";

      const image = document.createElement("img");
      image.src = photo.image;
      image.alt = photo.title;
      image.loading = "lazy";
      image.style.maxWidth = "100%";
      image.style.height = "auto";
      image.style.display = "block";
      image.style.marginBottom = "12px";

      const title = document.createElement("h3");
      title.textContent = photo.title;

      const creator = document.createElement("p");
      creator.className = "result-details";
      creator.textContent =
        `Creator: ${photo.creator || "Not specified"}`;

      const license = document.createElement("p");
      license.className = "result-details";
      license.textContent =
        `License: ${photo.license || "Check source page"}`;

      card.append(image, title, creator, license);
      addLink(card, photo.pageUrl, "View original and license");
      container.appendChild(card);
    });
  }

  // HOME SEARCH RESULTS PAGE
  const searchInput = document.getElementById("search-input");
  const resultsMessage = document.getElementById("results-message");
  const resultsList = document.getElementById("results-list");

  if (resultsList && resultsMessage) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";

    if (searchInput) searchInput.value = query;

    if (!query.trim()) {
      resultsMessage.textContent =
        "Enter a topic in the search bar to discover resources.";
    } else {
      const matches = searchResources(query);
      displayResults(matches, resultsList);

      resultsMessage.textContent = matches.length
        ? `${matches.length} sample result(s) for "${query}".`
        : `No sample results for "${query}". Try Python, JavaScript, GitHub or research.`;
    }
  }

  // EXPLORE PAGE: SAMPLE RESOURCES + BOOKS + PHOTOS + PAPERS
  const exploreForm = document.getElementById("explore-form");

  if (exploreForm) {
    const keywordInput = document.getElementById("keyword-search");
    const authorInput = document.getElementById("author-search");
    const domainSelect = document.getElementById("domain-select");
    const subdomainSelect = document.getElementById("subdomain-select");
    const fieldSelect = document.getElementById("field-select");

    const message = document.getElementById("explore-message");
    const sampleContainer = document.getElementById("explore-results");
    const booksContainer = document.getElementById("books-results");
    const photosContainer = document.getElementById("photos-results");
    const researchContainer = document.getElementById("crossref-results");

    exploreForm.addEventListener("submit", async event => {
      event.preventDefault();

      const keyword = keywordInput?.value.trim() || "";
      const author = authorInput?.value.trim() || "";
      const domain = domainSelect?.value || "";
      const subdomain = subdomainSelect?.value || "";
      const type = fieldSelect?.value || "all";

      if (!keyword && !author && !domain && !subdomain) {
        message.textContent =
          "Enter a keyword or author, or choose a domain or sub-domain.";
        return;
      }

      const query = [keyword, subdomain, domain]
        .filter(Boolean).join(" ");

      const sampleMatches = sampleResources.filter(resource => {
        const text = [
          resource.title,
          resource.description,
          resource.author,
          resource.source,
          resource.type,
          resource.domain,
          resource.subdomain,
          resource.keywords
        ].join(" ").toLowerCase();

        const keywordMatches = !keyword ||
          keyword.toLowerCase().split(/\s+/)
            .every(word => text.includes(word));

        const authorMatches = !author ||
          (resource.author || "").toLowerCase()
            .includes(author.toLowerCase());

        const domainMatches = !domain || resource.domain === domain;
        const subdomainMatches =
          !subdomain || resource.subdomain === subdomain;

        const typeMatches =
          type === "all" ||
          (type === "documentation" && resource.field === "documentation") ||
          (type === "web" && resource.field === "web");

        return keywordMatches && authorMatches &&
          domainMatches && subdomainMatches && typeMatches;
      });

      displayResults(sampleMatches, sampleContainer);

      [booksContainer, photosContainer, researchContainer].forEach(
        container => {
          if (container) showMessage(container, "");
        }
      );

      const tasks = [];

      if (type === "all" || type === "books") {
        tasks.push({
          name: "books",
          container: booksContainer,
          run: () => searchBooks(query || keyword, author),
          render: renderBooks
        });
      }

      if (type === "all" || type === "photos") {
        tasks.push({
          name: "photos",
          container: photosContainer,
          run: () => searchPhotos(query || keyword, author),
          render: renderPhotos
        });
      }

      if (type === "all" || type === "research") {
        tasks.push({
          name: "research",
          container: researchContainer,
          run: () => searchCrossref(query || keyword, author),
          render: renderResearch
        });
      }

      if (type === "documentation" || type === "web") {
        showMessage(
          booksContainer,
          "Choose All Resources, Books, Photographs, or Research Papers to search external sources."
        );
      }

      message.textContent =
        `Searching for "${keyword || query || "resources"}"` +
        (author ? ` by/associated with "${author}"` : "") + "...";

      const results = await Promise.allSettled(
        tasks.map(async task => {
          if (!task.container) {
            throw new Error(`Missing results container for ${task.name}`);
          }

          const data = await task.run();
          task.render(data, task.container);

          return { name: task.name, count: data.length };
        })
      );

      const summary = [];

      results.forEach((result, index) => {
        const task = tasks[index];

        if (result.status === "fulfilled") {
          summary.push(
            `${result.value.count} ${result.value.name} result(s)`
          );
        } else {
          console.error(`${task.name} search failed:`, result.reason);
          showMessage(
            task.container,
            `${task.name} search failed. Please try again.`
          );
          summary.push(`${task.name} unavailable`);
        }
      });

      message.textContent =
        `${sampleMatches.length} KNOVA resource(s). ` +
        summary.join("; ") + ".";
    });

    displayResults(sampleResources, sampleContainer);
  }

  // CONTACT FORM DEMO
  

const contactForm = document.getElementById("contact-form");

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();
        const status = document.getElementById("contact-status");

        const subject = encodeURIComponent(`KNOVA Contact Message from ${name}`);
        const body = encodeURIComponent(
            `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        );

        if (status) {
            status.textContent =
                "Please mail your queries to email below.Sorry For The Inconvenience Caused"
        }

        window.location.href =
            `mailto:dludbe2112@gmail.com?subject=${subject}&body=${body}`;
    });
}

});
