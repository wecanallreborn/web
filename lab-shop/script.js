const products = [
  {
    id: "night-watcher",
    name: "Значок «Ночной смотритель»",
    price: 120,
    sign: "01",
    description: "За три ночи у монитора без отрыва. Металл, кислотная эмаль.",
    image: "pictures/night-watcher.png",
  },
  {
    id: "window-frame",
    name: "Рамка «Окно напротив»",
    price: 250,
    sign: "02",
    description: "Пустая рамка для первого удачного кадра из клетки.",
    image: "pictures/window-frame.png",
  },
  {
    id: "mug",
    name: "Кружка «Не кормить»",
    price: 80,
    sign: "03",
    description: "Надпись внутри дна проявляется, когда чай заканчивается.",
    image: "pictures/mug.png",
  },
  {
    id: "plush-banana",
    name: "Плюшевый банан клуба",
    price: 60,
    sign: "04",
    description: "Валюта, которую нельзя потратить. Только поставить на полку.",
    image: "pictures/plush-banana.png",
  },
  {
    id: "poster",
    name: "Постер «Тридцать три клетки»",
    price: 190,
    sign: "05",
    description: "Сетка окон. Ни одно не подписано настоящим именем жильца.",
    image: "pictures/poster.png",
  },
  {
    id: "camera-charm",
    name: "Брелок камеры наблюдения",
    price: 95,
    sign: "06",
    description: "Маленький объектив. Красная точка не мигает, но все думают, что мигает.",
    image: "pictures/camera-charm.png",
  },
  {
    id: "great-cage",
    name: "Сертификат «Великая клетка»",
    price: 499,
    sign: "07",
    description: "Бумажный трофей высшего уровня. Доставка в конверте без обратного адреса.",
    image: "pictures/great-cage.png",
  },
  {
    id: "sticker-pack",
    name: "Набор стикеров соседей",
    price: 45,
    sign: "08",
    description: "Восемь силуэтов. Кто из них настоящий, решает покупатель.",
    image: "pictures/sticker-pack.png",
  }
];

// Ключ — имя полки в localStorage. Если смените строку, старая корзина «пропадёт».
const STORAGE_KEY = "monkey-cage-cart";

// let — переменная, которую можно перезаписать. cart начнётся с сохранённых данных или с пустого списка.
let cart = loadCart();

// document — вся страница. querySelector находит первый элемент по CSS-селектору.
const productGrid = document.querySelector("#product-grid");
const cartList = document.querySelector("#cart-list");
const cartCount = document.querySelector("#cart-count");
const cartTotal = document.querySelector("#cart-total");
const cartPanel = document.querySelector("#cart-panel");
const orderModal = document.querySelector("#order-modal");
const orderForm = document.querySelector("#order-form");
const orderMessage = document.querySelector("#order-message");

// addEventListener — «слушай событие». click срабатывает при нажатии.
document.querySelector("#open-cart").addEventListener("click", function () {
  cartPanel.classList.add("is-open"); // classList.add добавляет CSS-класс, панель выезжает
});

document.querySelector("#close-cart").addEventListener("click", function () {
  cartPanel.classList.remove("is-open");
});

document.querySelector("#open-order").addEventListener("click", function () {
  orderMessage.hidden = true; // прячем старое сообщение, если заказ уже создавали
  orderModal.hidden = false;  // hidden = false показывает модальное окно
});

document.querySelector("#close-order").addEventListener("click", function () {
  orderModal.hidden = true;
});

// submit — событие отправки формы.
orderForm.addEventListener("submit", function (event) {
  event.preventDefault(); // отменяем перезагрузку страницы, иначе сообщение сразу исчезнет
  orderMessage.hidden = false;
  orderMessage.textContent = "Заказ создан!"; // фраза из задания, не меняйте её
  cart = [];           // очищаем корзину после заказа
  saveCart();          // записываем пустую корзину
  renderCart();        // перерисовываем суммы
  orderForm.reset();   // очищаем поля формы
});

// Клик по витрине. Один слушатель на всю сетку — это называется делегирование.
productGrid.addEventListener("click", function (event) {
  const button = event.target.closest("[data-add]");
  // closest ищет ближайший элемент с атрибутом data-add. Если кликнули не по кнопке, будет null.
  if (!button) {
    return;
  }
  addToCart(button.dataset.add); // dataset.add читает значение data-add="id-товара"
});

cartList.addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }
  const id = button.dataset.id;
  if (button.dataset.action === "plus") {
    changeQty(id, 1);
  }
  if (button.dataset.action === "minus") {
    changeQty(id, -1);
  }
  if (button.dataset.action === "remove") {
    removeFromCart(id);
  }
});

renderProducts();
renderCart();

function renderProducts() {
  // map проходит по каждому товару и возвращает кусок HTML. join склеивает куски в одну строку.
  productGrid.innerHTML = products.map(function (product) {
    return (
      '<article class="card">' +
        '<img class="card-image" src="' + product.image + '" alt="' + product.name + '">' +
        '<h3>' + product.name + '</h3>' +
        '<p>' + product.description + '</p>' +
        '<p class="price">' + product.price + ' бананов</p>' +
        '<button type="button" data-add="' + product.id + '">Добавить в корзину</button>' +
      '</article>'
    );
  }).join("");
}

function addToCart(id) {
  const found = cart.find(function (item) {
    return item.id === id; // === сравнивает и значение, и тип
  });
  if (found) {
    found.qty += 1; // += 1 увеличивает количество
  } else {
    cart.push({ id: id, qty: 1 }); // push добавляет новый объект в конец массива
  }
  saveCart();
  renderCart();
  cartPanel.classList.add("is-open");
}

function changeQty(id, delta) {
  const found = cart.find(function (item) {
    return item.id === id;
  });
  if (!found) {
    return;
  }
  found.qty += delta;
  if (found.qty <= 0) {
    removeFromCart(id); // ноль штук — это уже удаление
    return;
  }
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(function (item) {
    return item.id !== id; // filter оставляет только те элементы, для которых условие истинно
  });
  saveCart();
  renderCart();
}

function renderCart() {
  if (cart.length === 0) {
    cartList.innerHTML = "<li>Корзина пуста.</li>";
  } else {
    cartList.innerHTML = cart.map(function (item) {
      const product = products.find(function (productItem) {
        return productItem.id === item.id;
      });
      const lineSum = product.price * item.qty;
      return (
        '<li class="cart-item">' +
          '<strong>' + product.name + '</strong>' +
          '<div class="qty">' +
            '<button type="button" data-action="minus" data-id="' + item.id + '">−</button>' +
            '<span>' + item.qty + '</span>' +
            '<button type="button" data-action="plus" data-id="' + item.id + '">+</button>' +
          '</div>' +
          '<p>' + lineSum + ' бананов</p>' +
          '<button type="button" class="remove" data-action="remove" data-id="' + item.id + '">Удалить</button>' +
        '</li>'
      );
    }).join("");
  }

  const totalQty = cart.reduce(function (sum, item) {
    return sum + item.qty; // reduce сворачивает массив в одно число
  }, 0);
  const totalPrice = cart.reduce(function (sum, item) {
    const product = products.find(function (productItem) {
      return productItem.id === item.id;
    });
    return sum + product.price * item.qty;
  }, 0);

  cartCount.textContent = totalQty;   // textContent меняет текст внутри элемента
  cartTotal.textContent = totalPrice;
}

function saveCart() {
  // JSON.stringify превращает массив в строку. localStorage умеет хранить только строки.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function loadCart() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    // JSON.parse делает из строки снова массив. try/catch нужен, если строка вдруг битая.
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (error) {
    return [];
  }
}
