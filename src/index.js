
const timeFormat = new Intl.DateTimeFormat('sv-SE', {
    hour: 'numeric', minute: 'numeric',
});
const timeFormat2 = new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
});

const dateFormat = new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric', month: 'numeric', day: 'numeric',
});

const currencyFormat = Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK'
});


export {currencyFormat, timeFormat, timeFormat2, dateFormat};


