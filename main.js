const books = [];
const STORAGE_KEY = 'BOOK_LIST';
const SAVED_EVENT = 'saved_books';
const RENDER_EVENT = 'render_books';
const SEARCH_EVENT = 'search_books';

if (localStorage.getItem(STORAGE_KEY)) {
  const storedBooks = JSON.parse(localStorage.getItem(STORAGE_KEY));
  storedBooks.forEach(item => books.push(item));
}

document.addEventListener('DOMContentLoaded', () => {
  document.dispatchEvent(new Event(RENDER_EVENT));

  const submitForm = document.getElementById('input-book');
  const searchForm = document.getElementById('search-book');

  submitForm.addEventListener('submit', (event) => {
    event.preventDefault();
    addBook();
  });

  searchForm.addEventListener('submit', (event) => {
    searchBook();
    event.preventDefault();
    document.dispatchEvent(new Event(SEARCH_EVENT));
  })
});

function searchBook() {
  const searchValue = document.getElementById('search').value;
  
  if (searchValue === "") {
    return null;
  }

  for (item of books) {
    if (item.title === searchValue) {
      return item;
    }
  }
  return false;
}

document.addEventListener('search_books', () => {
  const toRead = document.getElementById('toread-container');
  const finished = document.getElementById('finished-container');
  const searchValue = document.getElementById('search').value;
  const searchResult = searchBook();

  if (searchResult === null) {
    document.dispatchEvent(new Event(RENDER_EVENT));
  } else if (searchResult === false) {
    alert(`Um, you don\'t have a book titled "${searchValue}". So surprising, right?`);
    document.dispatchEvent(new Event(RENDER_EVENT));
  } else {
    const newElement = addList(searchResult);

    toRead.innerHTML = "";
    finished.innerHTML = "";

    if (searchResult.isComplete === true) {
      finished.append(newElement);
    } else {
      toRead.append(newElement);
    }
  }
})

function addBook() {
  const bookTitle = document.getElementById('title').value;
  const bookAuthor = document.getElementById('author').value;
  const bookYear = document.getElementById('year').value;
  const bookFinished = document.getElementById('check').checked;
  const bookCover = document.getElementById('cover').value;
  const generateID = +new Date();

  const bookObject = generateBookObject(generateID, bookTitle, bookAuthor, bookYear, bookCover, bookFinished);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateBookObject(id, title, author, year, cover, isComplete) {
  return {
    id,
    title,
    author,
    year,
    cover,
    isComplete
  }
}

function saveData() {
  if (typeof (Storage) === 'undefined') {
    alert('This browser didn\'t support WEB Storage!')
  } else {
    const booksParsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, booksParsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

document.addEventListener('saved_books', () => {
  alert('Data changed!');
});

function addList(books) {
  const container = document.createElement('div');
  container.classList.add('books-container');

  const img = document.createElement('img');
  img.setAttribute('src', `./assets/img/${books.cover}.jpg`);

  const booksDetail = document.createElement('div');
  booksDetail.classList.add('books-detail');

  const title = document.createElement('h4');
  title.classList.add('title');
  title.innerText = books.title;

  const author = document.createElement('h4');
  author.innerText = books.author;

  const year = document.createElement('h4');
  year.innerText = books.year;

  booksDetail.append(title, author, year);
  container.append(img, booksDetail);

  if (!books.isComplete) {
    const btnContainer = document.createElement('div');
    btnContainer.classList.add('btn-container');

    const btnCheck = document.createElement('button');
    btnCheck.classList.add('fa');
    btnCheck.classList.add('fa-check-square');

    btnCheck.addEventListener('click', () => {
      moveToFinished(books.id);
    })

    const btnTrash = document.createElement('button');
    btnTrash.classList.add('fa');
    btnTrash.classList.add('fa-trash');

    btnTrash.addEventListener('click', () => {
      removeBook(books.id);
    })

    btnContainer.append(btnCheck, btnTrash);
    container.append(btnContainer);
  } else {
    const btnContainer = document.createElement('div');
    btnContainer.classList.add('btn-container');

    const btnUndo = document.createElement('button');
    btnUndo.classList.add('fa');
    btnUndo.classList.add('fa-undo');

    btnUndo.addEventListener('click', () => {
      undoFinished(books.id);
    })

    const btnTrash = document.createElement('button');
    btnTrash.classList.add('fa');
    btnTrash.classList.add('fa-trash');

    btnTrash.addEventListener('click', () => {
      removeBook(books.id);
    })

    btnContainer.append(btnUndo, btnTrash);
    container.append(btnContainer);
  }

  return container;
}

document.addEventListener('render_books', () => {
  const toRead = document.getElementById('toread-container');
  const finished = document.getElementById('finished-container');

  toRead.innerHTML = "";
  finished.innerHTML = "";

  const isToreadExist = books.some(item => item.isComplete !== true);
  const isFinishedExist = books.some(item => item.isComplete !== false);
  const toreadEmptyMessage = toreadEmpty();
  const finishedEmptyMessage = finishedEmpty();

  if (!isToreadExist) {
    toRead.append(toreadEmptyMessage);
  }

  if (!isFinishedExist) {
    finished.append(finishedEmptyMessage);
  }

  for (const item of books) {
    const newElement = addList(item);

    if (item.isComplete) {
      finished.append(newElement);
    } else {
      toRead.append(newElement);
    }
  }

  booksCount();
})

function booksCount() {
  const displayToreadCount = document.getElementById('toread-count');
  const toreadCount = getToreadCount();
  displayToreadCount.innerText = `${toreadCount} book(s)`;

  const displayFinishedCount = document.getElementById('finished-count');
  const finishedCount = getFinishedCount();
  displayFinishedCount.innerText = `${finishedCount} book(s)`;
}

function getToreadCount() {
  const toreadBooks = books.filter(item => item.isComplete === false).length;
  return toreadBooks;
}

function getFinishedCount() {
  const finishedBooks = books.filter(item => item.isComplete === true).length;
  return finishedBooks;
}

function toreadEmpty() {
  const para = document.createElement('p');
  para.innerText = 'Dude, seriously? Not even a single book?';
  return para;
}

function finishedEmpty() {
  const para = document.createElement('p');
  para.innerText = 'Haven\'t finished a single book yet, huh?';
  return para;
}

function matchBook(bookID) {
  for (const item of books) {
    if (item.id === bookID) {
      return item;
    }
  }
  return null;
}

function matchBookIndex(bookID) {
  for (const i in books) {
    if (books[i].id === bookID) {
      return i;
    }
  }
  return null;
}

function moveToFinished(bookID) {
 const bookTarget = matchBook(bookID);

 if (bookTarget === null) return;

 bookTarget.isComplete = true;
 document.dispatchEvent(new Event(RENDER_EVENT));
 saveData();
}

function undoFinished(bookID) {
  const bookTarget = matchBook(bookID);

  if (bookTarget === null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook(bookID) {
  const bookTargetIndex = matchBookIndex(bookID);

  if (bookTargetIndex === null) return;

  books.splice(bookTargetIndex, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

