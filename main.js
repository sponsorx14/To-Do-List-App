$(function() {

  const baseUrl = 'https://kodilla.com/pl/bootcamp-api';
  const myHeaders = {
    'X-Client-Id': 2510,
    'X-Auth-Token': '12563a00c94acdb4b0dc3ad52a06a6ff'
  };


  let board = {
  	name: 'Tablica Kanban',
  	createColumn: function(column) {
  	  this.element.append(column.element);
  	  initSortable();
  	},
  	element: $('#board .column-container')
  };


  $('.create-column').click(function() {
      const columnName = prompt('Enter a column name');
      $.ajax({
        url: baseUrl + '/column',
        method: 'POST',
        data: {
          name: columnName
        },
        success: function(response) {
          const column = new Column(response.id, columnName);
          board.createColumn(column);
        }
      });
    });

  $.ajaxSetup({
    headers: myHeaders
  });
  $.ajax({
    url: baseUrl + '/board',
    method: 'GET',
    success: function(response) {
      setupColumns(response.columns);
    }
});


  function Column(id, name) {
    let self = this;

    this.id = id;
    this.name = name || 'No name';
    this.element = createColumn();

    function createColumn() {
      const column = $('<div class="column"></div>');
      const columnTitle = $('<h2 class="column-title">' + self.name + '</h2>');
      const columnCardList = $('<ul class="card-list"></ul>');
      const columnAddCard = $('<button class="column-add-card">Add card</button>');
      const columnDelete = $('<button class="btn-delete">x</button>');

      columnDelete.click(function() {
        self.deleteColumn();
      });

      columnAddCard.click(function(event){
        const cardName = prompt("Enter the name of the card");
        event.preventDefault();
        $.ajax({
          url: baseUrl + '/card',
          method: 'POST',
          data: {
            name: cardName,
            bootcamp_kanban_column_id: self.id
          },
          success: function(response) {
            let card = new Card(response.id, cardName);
            self.createCard(card);
          }
        });
      });

      column.append(columnTitle)
        .append(columnAddCard)
        .append(columnDelete)
        .append(columnCardList);

      return column;
    }
  }
  Column.prototype = {
    createCard: function(card) {
      this.element.children('ul').append(card.element);
      initSortable();
    },
    deleteColumn: function() {
      let self = this;
      $.ajax({
        url: baseUrl + '/column/' + self.id,
        method: 'DELETE',
        success: function(response) {
          self.element.remove();
        }
      })
    }
  };

  function Card(id, name) {
    let self = this;

    this.id = id;
    this.name = name;
    this.element = createCard();

    function createCard() {
      const card = $('<li class="card"></li>');
      const cardDeleteBtn = $('<button class="btn-delete">x</button>');
      const cardDescription = $('<p class="card-description"></p>');

      cardDeleteBtn.click(function() {
        self.removeCard();
      });

      card.append(cardDeleteBtn);
      cardDescription.text(self.name);
      card.append(cardDescription);

      return card;
    }
  }
  Card.prototype = {
    removeCard: function() {
      let self = this;
      $.ajax({
        url: baseUrl + '/card/' + self.id,
        method: 'DELETE',
        success: function() {
          self.element.remove();
        }
      });
    }
  };

  function setupColumns(columns) {
      columns.forEach(function(column){
    		let col = new Column(column.id, column.name);
          board.createColumn(col);
          setupCards(col, column.cards);
      });
  }

  function setupCards(col, cards) {
  	cards.forEach(function (card) {
        card = new Card(card.id, card.name, card.bootcamp_kanban_column_id);
      	col.createCard(card);
    	});
  }

  function initSortable(){
    $('.card-list').sortable({
      connectWith: '.card-list',
      placeholder: 'card-placeholder'
    }).disableSelection();
  }
});
