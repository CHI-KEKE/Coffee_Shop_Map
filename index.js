const form = document.querySelector(".form");
let inputName = document.querySelector(".form__input--name");
let inputSeat = document.querySelector(".form__input--seat");
let inputPrice = document.querySelector(".form__input--price");
let inputCoffee = document.querySelector(".form__input--coffee");
let inputSocket = document.querySelector(".form__input--socket");
let inputToilet = document.querySelector(".form__input--toilet");
let inputMRT = document.querySelector(".form__input--MRT");

const slides = document.querySelectorAll(".slide");
let slider = document.querySelector(".slider");


//////////////////Coffee class///////////////////
class CoffeeShop {
  date = new Date();
  id = (Date.now() + "").slice(-10);

  constructor(coords, name, seat, price, coffee, socket, toilet, MRT) {
    this.coords = coords;
    this.name = name;
    this.seat = seat;
    this.price = price;
    this.coffee = coffee;
    this.socket = socket;
    this.toilet = toilet;
    this.MRT = MRT;
  }
}


////////////APP///////////////////////////////
class App {
  #map;
  #mapEvent;
  #mapZoomLevel = 13;
  #coffeeShops = [];

  constructor() {

    //get the position and storage
    this._getPosition();
    

    //add event to form-submit/slider-click
    form.addEventListener("submit", this._newCoffeeShop.bind(this));
    slider.addEventListener("click",this._moveToMarker.bind(this))

  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("We could not found where you are!");
        }
      );
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map("map").setView(coords, this.#mapZoomLevel);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this._showForm.bind(this));
    this._getLocalStorage();
    this.#coffeeShops.forEach((shop) =>{
        this._renderWorkoutContent(shop);
    })
  }

  _showForm(map_e) {
    this.#mapEvent = map_e;
    form.classList.remove("hidden");
    inputName.focus();
  }

  _hideForm(){
    inputName.value = inputSeat.value = inputPrice.value =inputCoffee.value =inputSocket.value = inputToilet.value = inputMRT.value = '';

    // form.style.display = "none";
    form.classList.add("hidden");
    // setTimeout(() => form.style.display = "grid",1000);
  }

  _newCoffeeShop(e) {
    e.preventDefault();
    const { lat, lng } = this.#mapEvent.latlng;
    const name = inputName.value;
    const seat = inputSeat.value;
    const price = inputPrice.value;
    const coffee = inputCoffee.value;
    const socket = inputSocket.value;
    const toilet = inputToilet.value;
    const MRT = inputMRT.value;
    let inputs = [name,seat,seat,price,coffee,socket,toilet,MRT]
    if (inputs.some((inpu)=>inpu === '')) {return alert("Please complete it!");
    }

    const coffeeShop = new CoffeeShop(
      [lat, lng],
      name,
      seat,
      price,
      coffee,
      socket,
      toilet,
      MRT
    );

    this.#coffeeShops.push(coffeeShop);

    this._renderCoffeeShopConent(coffeeShop);
    this._renderCoffeeShop(coffeeShop);
    this._hideForm();
    this._setLocalStorage();
  }

  _renderCoffeeShopConent(coffeeShop) {
    L.marker(coffeeShop.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${coffeeShop.socket}-popup`,
          content: `<p>${coffeeShop.name}\n${
            coffeeShop.socket === "yes" ? "🔋" : "🪫"
          }\n${coffeeShop.seat < 3 ? "🪑" : "🛋️"}\n${coffeeShop.toilet ==="yes"?"💩":"🐒"}\n${coffeeShop.MRT ==="nearby"? "👣":"🚴‍♀️"}${coffeeShop.price < 3?"🪙":"💸"}</p>`,
        })
      )
      .openPopup();
  }

  _renderCoffeeShop(coffeeShop) {
    let html = `
            <div class="slide" data-id=${coffeeShop.id}>
                <h2 class="coffee__title">🏬 ${coffeeShop.name}</h2>
                <div class="coffee__details">
                    <span class="coffee__icon">🪑</span>
                    <span class="coffee__value">${coffeeShop.seat}</span>
                    <span class="coffee__unit">/5</span>
                </div>
                <div class="coffee__details">
                    <span class="coffee__icon">💰</span>
                    <span class="coffee__value">${coffeeShop.price}</span>
                    <span class="coffee__unit">/5</span>
                </div>
                <div class="coffee__details">
                    <span class="coffee__icon">☕️</span>
                    <span class="coffee__value"> ${coffeeShop.coffee}</span>
                    <span class="coffee__unit">/5</span>
                </div>
                <div class="coffee__details">
                    <span class="coffee__icon">🔌</span>
                    <span class="coffee__value"> ${coffeeShop.socket}</span>

                </div>
                <div class="coffee__details">
                    <span class="coffee__icon">🚽</span>
                    <span class="coffee__value"> ${coffeeShop.toilet}</span>

                </div>
                <div class="coffee__details">
                    <span class="coffee__icon">🚝</span>
                    <span class="coffee__value"> ${ coffeeShop.MRT}</span>
                </div>
            </div>`
        slider.insertAdjacentHTML("afterbegin",html);
        let newAllSlides = document.querySelectorAll(".slide")
        newAllSlides.forEach((s,i) => s.style.transform = `translateX(${100*i}%)`)
        
  }

  _moveToMarker(e){
    const coffeeShopElement = e.target.closest(".slide");
    console.log(coffeeShopElement,this.#coffeeShops)
    if(!coffeeShopElement) return;
    const coffeeShop = this.#coffeeShops.find((coffeeShop) => coffeeShop.id === coffeeShopElement.dataset.id);
    this.#map.setView(coffeeShop.coords, this.#mapZoomLevel,{
        animate:true,
        pan:{
            duration:1
        }
    })
  }

   _setLocalStorage(){
    localStorage.setItem("coffeeShop",JSON.stringify(this.#coffeeShops));
   }

   _getLocalStorage(){
    const data = JSON.parse(localStorage.getItem("coffeeShop"))

    if(!data) return;
    this.#coffeeShops = data;

    }
   

   reset(){
    localStorage.removeItem("coffeeShop");
    location.reload();
   }



}

const app = new App();




const GoToSlide = function () {
  slides.forEach(
    (s, i) => (s.style.transform = `translateX(${100 * (i)}%)`)
  );
};

GoToSlide();