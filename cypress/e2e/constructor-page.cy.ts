describe('Проверяем доступность приложения', () => {
  it('сервис должен быть доступен по адресу localhost:4000', () => {
    cy.visit('http://localhost:4000');
  });
});

beforeEach(() => {
  window.localStorage.setItem('refreshToken', 'testRefreshToken');
  cy.setCookie('accessToken', 'testAccessToken');

  cy.intercept('GET', 'api/ingredients', {
    fixture: 'ingredients'
  }).as('getIngredients');

  cy.intercept('GET', 'api/auth/user', {
    fixture: 'user'
  }).as('getUser');

  cy.visit('localhost:4000');
  cy.wait('@getIngredients');
  cy.wait('@getUser');
});

afterEach('Очистка localStorege и Cookies', () => {
  cy.clearAllLocalStorage();
  cy.clearAllCookies();
});

describe('Проверка работоспособности страницы - ConstructorPage', () => {
  it('Проверка добавления ингредиентов в конструктор', () => {
    cy.get('[data-cy="bun_constructor_item_up_clear"]').should('exist');
    cy.get('[data-cy="bun_constructor_item_down_clear"]').should('exist');
    cy.get('[data-cy="ingredient_constructor_item"]').should('not.exist');

    cy.get('[data-cy="bun_0"]').should('exist');
    cy.get('[data-cy="bun_0"] > .common_button').should('exist').click();

    cy.get('[data-cy="ingredient_0"]').should('exist');
    cy.get(':nth-child(4) > [data-cy="ingredient_0"] > .common_button')
      .should('exist')
      .click();
    cy.get('[data-cy="bun_constructor_item_up"]').should('exist');
    cy.get('[data-cy="bun_constructor_item_down"]').should('exist');
    cy.get('[data-cy="ingredient_constructor_item"]').should('exist');
  });

  it('Проверка открытия и закрытия модального окна одного ингредиента - через оверлей', () => {
    const ingredientName = 'Краторная булка N-200i';

    cy.get('[data-cy="modal_ingredient"]').should('not.exist');
    cy.get('[data-cy="bun_0"]').should('exist').click();
    cy.get('[data-cy="modal_ingredient"]').should('be.visible');
    cy.get('[data-cy="ingredient_modal"] > .text_type_main-medium').should(
      'contain.text',
      ingredientName
    );
    cy.get('[data-cy="modal_overlay"]').should('exist');
    cy.get('[data-cy="modal_overlay"]').click({ force: true });
    cy.get('[data-cy="modal_ingredient"]').should('not.exist');
    cy.get('[data-cy="modal_overlay"]').should('not.exist');
  });

  it('Проверка открытия и закрытия модального окна одного ингредиента - через кнопку закрытия', () => {
    const ingredientName = 'Краторная булка N-200i';

    cy.get('[data-cy="modal_ingredient"]').should('not.exist');
    cy.get('[data-cy="bun_0"]').should('exist').click();
    cy.get('[data-cy="modal_ingredient"]').should('be.visible');
    cy.get('[data-cy="ingredient_modal"] > .text_type_main-medium').should(
      'contain.text',
      ingredientName
    );
    cy.get('[data-cy="btn_close_modal"]').click();
    cy.get('[data-cy="modal_ingredient"]').should('not.exist');
  });

  it('Проверка полного цикла заказа товара', () => {
    cy.get('[data-cy="bun_constructor_item_up_clear"]').should('exist');
    cy.get('[data-cy="bun_constructor_item_down_clear"]').should('exist');
    cy.get('[data-cy="ingredient_constructor_item"]').should('not.exist');

    cy.get('[data-cy="bun_0"]').should('exist');
    cy.get('[data-cy="bun_0"] > .common_button').should('exist').click();
    cy.get('[data-cy="ingredient_0"]').should('exist');
    cy.get(':nth-child(4) > [data-cy="ingredient_0"] > .common_button')
      .should('exist')
      .click();

    cy.intercept('POST', 'api/orders', {
      fixture: 'newOrder'
    }).as('newOrder');

    cy.get('[data-cy="new_order_btn"]').click();
    cy.wait('@newOrder');
    cy.fixture('newOrder').then((newOrder) => {
      cy.get('[data-cy="new_order_number"]').contains(newOrder.order.number);
    });

    cy.wait(1000);

    cy.get('[data-cy="bun_constructor_item_up_clear"]').should('exist');
    cy.get('[data-cy="bun_constructor_item_down_clear"]').should('exist');
    cy.get('[data-cy="ingredient_constructor_item"]').should('not.exist');
    cy.get('[data-cy="btn_close_modal"]').should('exist').click();
  });
});
