const apiKey = 'CRST3WELNGEHO2WO'; // Alpha Vantage
const fmpKey = '240tkG7ei2DYVdDWoD1xZPXajAE1XehK'; // FMP

const searchBtn = document.getElementById('search-btn');
const stockInput = document.getElementById('stock-input');
const marketSelect = document.getElementById('market-select');
const suggestionsBox = document.getElementById('suggestions');
const ctx = document.getElementById('stockChart').getContext('2d');

// Chart init
let stockChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Stock Price',
      data: [],
      borderColor: '#00ffcc',
      tension: 0.3,
      fill: false
    }]
  },
  options: {
    plugins: {
      legend: {
        labels: { color: '#f5f5f5' }
      }
    },
    scales: {
      x: {
        ticks: { color: '#ccc' }
      },
      y: {
        beginAtZero: false,
        ticks: { color: '#ccc' }
      }
    }
  }
});

// Fetch stock data
function fetchStockData(symbol, market) {
  if (market === 'india') {
    fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}.BSE&apikey=${apiKey}`)
      .then(res => res.json())
      .then(data => {
        const timeSeries = data['Time Series (Daily)'];
        if (!timeSeries) {
          alert('Invalid Indian symbol or API limit reached');
          return;
        }

        const dates = Object.keys(timeSeries).slice(0, 30).reverse();
        const prices = dates.map(date => parseFloat(timeSeries[date]['4. close']));

        stockChart.data.labels = dates;
        stockChart.data.datasets[0].data = prices;
        stockChart.data.datasets[0].label = `${symbol} (BSE) Closing Prices`;
        stockChart.update();
      })
      .catch(err => {
        console.error('Fetch error:', err);
        alert('Failed to fetch BSE stock data.');
      });

  } else {
    fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`)
      .then(res => res.json())
      .then(data => {
        const timeSeries = data['Time Series (Daily)'];
        if (!timeSeries) {
          alert('Invalid symbol or API limit reached');
          return;
        }

        const dates = Object.keys(timeSeries).slice(0, 30).reverse();
        const prices = dates.map(date => parseFloat(timeSeries[date]['4. close']));

        stockChart.data.labels = dates;
        stockChart.data.datasets[0].data = prices;
        stockChart.data.datasets[0].label = `${symbol} Closing Prices`;
        stockChart.update();
      })
      .catch(err => {
        console.error('Fetch error:', err);
        alert('Failed to fetch stock data.');
      });
  }
}

// Search event
searchBtn.addEventListener('click', () => {
  const symbol = stockInput.value.trim().toUpperCase();
  const market = marketSelect.value;
  if (!symbol) {
    alert('Please enter a stock symbol');
    return;
  }
  suggestionsBox.innerHTML = '';
  fetchStockData(symbol, market);
});

// Autocomplete suggestions
let debounceTimeout = null;
stockInput.addEventListener('input', () => {
  const query = stockInput.value.trim();
  const market = marketSelect.value;
  suggestionsBox.innerHTML = '';
  if (query.length < 2) return;

  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    if (market === 'india') {
      // Local static symbols list (basic NSE/BSE examples)
      const indianStocks = [
        { symbol: 'RELIANCE', name: 'Reliance Industries' },
        { symbol: 'TCS', name: 'Tata Consultancy Services' },
        { symbol: 'INFY', name: 'Infosys Ltd' },
        { symbol: 'HDFCBANK', name: 'HDFC Bank' },
        { symbol: 'ICICIBANK', name: 'ICICI Bank' },
        { symbol: 'SBIN', name: 'State Bank of India' }
      ];

      const filtered = indianStocks.filter(stock =>
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
      );

      filtered.forEach(stock => {
        const item = document.createElement('div');
        item.textContent = `${stock.symbol} - ${stock.name}`;
        item.addEventListener('click', () => {
          stockInput.value = stock.symbol;
          suggestionsBox.innerHTML = '';
          fetchStockData(stock.symbol, 'india');
        });
        suggestionsBox.appendChild(item);
      });

      if (filtered.length === 0) {
        const noResult = document.createElement('div');
        noResult.textContent = 'No Indian stock found';
        suggestionsBox.appendChild(noResult);
      }

    } else {
      // Global stocks - FMP API
      fetch(`https://financialmodelingprep.com/api/v3/search-name?query=${query}&limit=5&apikey=${fmpKey}`)
        .then(res => res.json())
        .then(results => {
          suggestionsBox.innerHTML = '';
          if (!results || results.length === 0) {
            const noResult = document.createElement('div');
            noResult.textContent = 'No results found';
            suggestionsBox.appendChild(noResult);
            return;
          }

          results.forEach(stock => {
            const item = document.createElement('div');
            item.textContent = `${stock.symbol} - ${stock.name}`;
            item.addEventListener('click', () => {
              stockInput.value = stock.symbol;
              suggestionsBox.innerHTML = '';
              fetchStockData(stock.symbol, 'global');
            });
            suggestionsBox.appendChild(item);
          });
        })
        .catch(err => {
          console.error('Suggestion error:', err);
          const errorItem = document.createElement('div');
          errorItem.textContent = 'Error fetching suggestions';
          suggestionsBox.appendChild(errorItem);
        });
    }
  }, 300);
});

// Hide suggestions on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.stock-search')) {
    suggestionsBox.innerHTML = '';
  }
});
