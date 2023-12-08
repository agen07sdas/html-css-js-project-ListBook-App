// Konstanta yang menyimpan nama event yang digunakan untuk memberi tahu bahwa data To-Do telah disimpan.
const SAVED_EVENT = 'saved-book'
// Konstanta yang menyimpan kunci untuk menyimpan dan mengambil data dari localStorage.
const STORAGE_KEY = 'BOOK_APPS'

function isStorageExist () {
    if (typeof (Storage) === undefined){
        alert('browser tidak mendukung')
        return false
    } else {
        return true
    }
}

// document.addEventListener(SAVED_EVENT, function() {
//     console.log(localStorage.getItem(STORAGE_KEY))
// })

const books = []

function saveData(){
    if (isStorageExist()) {
        const parsed = JSON.stringify(books)
        localStorage.setItem(STORAGE_KEY, parsed)
        document.dispatchEvent( new Event(SAVED_EVENT))
    }
}

// CONSTUM EVENT
const RENDER_EVENT = 'render-book'

document.addEventListener('DOMContentLoaded', function() {
    const submitForm = document.getElementById('inputBook')
    submitForm.addEventListener('submit', function(event) {
        event.preventDefault()
        addBook()
    })

    if (isStorageExist()){
        loadDataFromStorage()
    }

    const bookSubmitButton = document.getElementById('bookSubmit')
    const inputBookIsComplete = document.getElementById('inputBookIsComplete')

    inputBookIsComplete.addEventListener('change', function() {
        updateButtonText()
    })
     function updateButtonText() {
        const buttonText = inputBookIsComplete.checked ? 'Selesai Dibaca' : 'Belum Selesai Di Baca'
        bookSubmitButton.innerHTML = `Masukkan Buku ke rak <span>${buttonText}</span>`
     }

     const searchForm = document.getElementById('searchBook')
     searchForm.addEventListener('submit', function(event){
        event.preventDefault()
        searchBooks()
     })
})

// nambah buku
function addBook() {
    const judul = document.getElementById('inputBookTitle').value
    const penulis = document.getElementById('inputBookAuthor').value
    const tahun = document.getElementById('inputBookYear').value
    const selesai = document.getElementById('inputBookIsComplete').checked

    const generateID = generateId()
    const bookObject = generateBookObject(generateID, judul, penulis, tahun, selesai)
    books.push(bookObject)

    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()

    document.getElementById('inputBookTitle').value = ''
    document.getElementById('inputBookAuthor').value = ''
    document.getElementById('inputBookYear').value = ''
    document.getElementById('inputBookIsComplete').checked = false

    console.log(typeof(tahun))
}

function generateId() {
    return +new Date()
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id, title, author, year: parseInt(year), isComplete
    }
}

// event saat render-book
document.addEventListener(RENDER_EVENT, function() {
    const uncompletedBookList = document.getElementById('incompleteBookshelfList')
    uncompletedBookList.textContent = ''

    const completedBookList = document.getElementById('completeBookshelfList')
    completedBookList.textContent = ''

    for(const bookItem of books) {
        const bookElement = makeBook(bookItem)
        if(!bookItem.isComplete)
            uncompletedBookList.appendChild(bookElement)
        else
            completedBookList.appendChild(bookElement)
    }
    // console.log(uncompletedBook)
})

function makeBook(bookObject) {
    const judul = document.createElement('h3')
    judul.innerText = bookObject.title

    const penulis = document.createElement('p')
    penulis.innerText = bookObject.author

    const tahun = document.createElement('p')
    tahun.innerText = bookObject.year.toString()

    const tombol = document.createElement('div')
    tombol.classList.add('action')

    const bungkus = document.createElement('article')
    bungkus.classList.add('book_item')
    bungkus.append(judul)
    bungkus.appendChild(penulis)
    bungkus.appendChild(tahun)
    bungkus.appendChild(tombol)
    bungkus.setAttribute('id', `book-${bookObject.id}`)

    if(bookObject.isComplete){
        const undoButton = document.createElement('button')
        undoButton.classList.add('green')
        undoButton.innerText= 'Belum Selesai dibaca'
        undoButton.addEventListener('click', function() {
            undoBookFromCompleted(bookObject.id)
        })

        const hapusBuku = document.createElement('button')
        hapusBuku.classList.add('red')
        hapusBuku.innerText = 'Hapus buku'
        hapusBuku.addEventListener('click', function() {
            removeFromBookCompleted(bookObject.id)
        })

        tombol.appendChild(undoButton)
        tombol.appendChild(hapusBuku)
    } else {
        const checkButton = document.createElement('button')
        checkButton.classList.add('green')
        checkButton.innerText = 'Selesai di Baca'
        checkButton.addEventListener('click', function(){
            addBookCompleted(bookObject.id)
        })

        const hapusBuku = document.createElement('button')
        hapusBuku.classList.add('red')
        hapusBuku.innerText = 'Hapus buku'
        hapusBuku.addEventListener('click', function() {
            removeFromBookCompleted(bookObject.id)
        })
        tombol.appendChild(checkButton)
        tombol.appendChild(hapusBuku)
    }
    return bungkus
}

function addBookCompleted(bookId) {
    const bookTarget = findBook(bookId)

    if(bookTarget == null) return

    bookTarget.isComplete = true
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

function findBook(bookId) {
    for( const bookItem of books){
        if(bookItem.id == bookId)
        return bookItem
    }
    return null
}

// hapus buku kurang
function removeFromBookCompleted(bookId) {
    const bookTargetIndex = findBookIndex(bookId)
    if(bookTargetIndex === -1) return

    books.splice(bookTargetIndex, 1)
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

function undoBookFromCompleted(bookId) {
    const bookTargetIndex = findBookIndex(bookId)
    if(bookTargetIndex === -1) return

    const bookTarget = books[bookTargetIndex]

    bookTarget.isComplete = false

    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

function findBookIndex(bookId) {
    for(const index in books) {
        if (books[index].id == bookId) {
            return index
        }
    }
    return -1
}

function loadDataFromStorage() {
    const serializeData =  localStorage.getItem(STORAGE_KEY)
    let data = JSON.parse(serializeData)
    
    if(data !== null) {
        for (const book of data) {
            books.push(book)
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT))
}


function searchBooks() {
    const searchTitle = document.getElementById('searchBookTitle').value.toLowerCase()

    // filter
    const searchResult = books.filter(function(book) {
        const lowerCaseTitle = book.title.toLowerCase()
        const lowerCaseAuthor = book.author.toLowerCase()
        const year = book.year.toString().toLowerCase() // untuk tahun ubah ke string dulu

        return lowerCaseTitle.includes(searchTitle) || lowerCaseAuthor.includes(searchTitle) || year.includes(searchTitle)
    })

    renderSearchResult(searchResult)
}

function renderSearchResult(results) {
    const inCompleteBookList = document.getElementById('incompleteBookshelfList')
    const completeBookList = document.getElementById('completeBookshelfList')

    inCompleteBookList.textContent = ''
    completeBookList.textContent = ''

    for(const bookItem of results) {
        const bookElement = makeBook(bookItem)

        if(!bookItem.isComplete) {
            inCompleteBookList.appendChild(bookElement)
        } else {
            completeBookList.appendChild(bookElement)
        }
    }

    // kosngkan form cari
    const searchForm = document.getElementById('searchBook')
    searchForm.reset()
}