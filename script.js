const apiUrl = 'https://potterapi-fedeperin.vercel.app/en/books'

const booksContainer = document.getElementById('books-container')
const searchInput = document.getElementById('search-input')
const filterYear = document.getElementById('filter-year')
const sortOptions = document.getElementById('sort-options')

const bookModal = new bootstrap.Modal(document.getElementById('bookModal'))
const modalBookTitle = document.getElementById('bookModalLabel')
const modalBookCover = document.getElementById('modal-cover')
const bookTitle = document.getElementById('modal-originalTitle')
const releaseDate = document.getElementById('modal-releaseDate')
const numOfPages = document.getElementById('modal-pages')
const bookGenre = document.getElementById('modal-genre')
const bookDesc = document.getElementById('modal-description')
const genre = 'Fantasy'

let allBooks = []
let filteredBooks = []

//Hämtar böckerna från API:et
function fetchBooks() {
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP fel, status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (!Array.isArray(data)) {
        console.log('Error: Not an array!')
      }
      allBooks = data

      populateFilterYear(allBooks)
      displayBooks(allBooks)
      createBookCard(allBooks)
    })
    .catch((error) => {
      console.log('Error: ' + error)
      booksContainer.innerHTML = `<p class="text-error">Kunde inte hämta böcker</p>`
    })
}

//Lägger till varje år man kan söka på i rullistan för År
function populateFilterYear(books) {
  //Skapar en ny array baserad på utgivningsdatum och gör att det bara står året, inte datum OCH år, när vi loggar ut det till sidan. Annars hade det funkar att anropa books.forEach, och gjort textContent year.releaseDate, så hade vi fått upp både datum och år.
  let years = [
    ...new Set(books.map((book) => new Date(book.releaseDate).getFullYear()))
  ].sort((a, b) => a - b)
  years.forEach((year) => {
    let createOption = document.createElement('option')
    createOption.value = year
    createOption.textContent = year
    filterYear.appendChild(createOption)
  })
}

//Skapa kort med innehåll
function createBookCard(book) {
  //|| är en fallback om titeln inte finns, så att kortet inte blir tomt
  const title = book.title || 'No title'
  const releaseDate = book.releaseDate || 'Unknown date'
  const desc = book.description || 'No description avaliable'
  const bookCover = book.cover || 'No image avaliable'
  const numOfPages = book.pages || 'No pages'

  return `
          <div class="col-md-4">
            <div class="card book-card h-100">
                <img src="${bookCover}" class="card-img-top" alt="${title}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${title}</h5>
                    <p>${truncateText(desc, 150)}</p>
                    <p>Utgivningsdatum: ${releaseDate}</p>
                    <p>Number of pages: ${numOfPages}</p>
                    <p>Genre: ${genre}</p>
                    <button class="btn btn-primary mt-auto" onclick="showBookDetails(${
                      book.number
                    })">Läs mer</button>
                </div>
            </div>
        </div>
        `
}

function truncateText(text, maxLength) {
  if (!text) return ''
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...'
  }
  return text
}

//Visa böckerna på sidan
function displayBooks(books) {
  //Array.isArray? Vad? Varför inte books.isArray?: Det finns ingen metod som heter isArray() direkt på array-objekt i JavaScript
  if (Array.isArray(books) && books.length > 0) {
    const bookCards = books.map((book) => createBookCard(book)).join('')
    booksContainer.innerHTML = bookCards
  }
  //Varför behövs ingen return här?
  //Funktionen har redan uppdaterat DOM-elementet booksContainer inuti funktionen, vilket är dess primära syfte. Detta är en sidoeffekt, och funktionen behöver inte returnera något eftersom uppdateringen av DOM är tillräcklig.
  //Om en funktion ska returnera ett värde (som en beräkning eller ett resultat), skulle vi behöva använda return. Men här sker den synliga effekten direkt på sidan genom att HTML-koden sätts i DOM-elementet, vilket innebär att inget värde behövs efter funktionens körning.
  //Du skulle använda return om funktionen förväntas ge ett resultat som kan användas av andra funktioner eller kodavsnitt. Till exempel, om du ville att displayBooks() skulle returnera den genererade HTML-strängen snarare än att direkt uppdatera sidan
  //I den nuvarande versionen uppdaterar dock funktionen direkt webbsidan och därför behövs ingen return.
}

//Populera modals - pop-uperna
function showBookDetails(bookNum) {
  const book = allBooks.find(
    (individualBook) => individualBook.number === bookNum
  )
  if (!book) {
    booksContainer.innerHTML = "We can't find the book"
    console.error('Bok hittas ej')
    return
  }
  bookTitle.textContent = book.originalTitle
  releaseDate.textContent = book.releaseDate
  numOfPages.textContent = book.pages
  bookGenre.textContent = genre
  modalBookCover.textContent = book.title
  modalBookCover.src = book.cover || "picture can't be found"
  bookDesc.textContent = book.description
  bookModal.show()
}

//Ta in value från sökfälten och filtrera på dom.
function applyFilters() {
  const searchTerm = searchInput.value.trim().toLowerCase()
  const selectedYear = filterYear.value
  const selectedSort = sortOptions.value

  filteredBooks = allBooks.filter((book) => {
    const matchesSearchTerm = book.title.toLowerCase().includes(searchTerm)
    const matchesYear = selectedYear
      ? new Date(book.releaseDate).getFullYear() == parseInt(selectedYear)
      : true
    return matchesSearchTerm && matchesYear
  })

  if (selectedSort) {
    //I det här fallet är [key, order] inte ett variabelnamn, utan en syntax för att destrukturera en array till två variabler. Split("-") splittar valuet title-asc och tilldelar key=title och order=asc. På så sätt kan vi använda key och order för att skapa vår if-sats nedan.
    const [key, order] = selectedSort.split('-')
    filteredBooks.sort((book1, book2) => {
      if (key === 'title') {
        return order === 'asc'
          ? book1.title.localeCompare(book2.title)
          : book2.title.localeCompare(book1.title)
      } else if (key === 'releaseDate') {
        return order === 'asc'
          ? new Date(book1.releaseDate) - new Date(book2.releaseDate)
          : new Date(book2.releaseDate) - new Date(book1.releaseDate)
      }
    })
  }
  displayBooks(filteredBooks)
}

//Event listeners
//Hanteras i HTML:en

//Starta applikationen
fetchBooks()
