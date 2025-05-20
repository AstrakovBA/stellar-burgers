const testUrl = 'http://localhost:4000';

const SELECTORS = {
  BUN_0: '[data-cy="bun_0"]',
  INGREDIENT_0: '[data-cy="ingredient_0"]',
  BUN_CONSTRUCTOR_UP: '[data-cy="bun_constructor_item_up"]',
  BUN_CONSTRUCTOR_DOWN: '[data-cy="bun_constructor_item_down"]',
  BUN_CONSTRUCTOR_UP_CLEAR: '[data-cy="bun_constructor_item_up_clear"]',
  BUN_CONSTRUCTOR_DOWN_CLEAR: '[data-cy="bun_constructor_item_down_clear"]',
  INGREDIENT_CONSTRUCTOR_ITEM: '[data-cy="ingredient_constructor_item"]',
  MODAL_INGREDIENT: '[data-cy="modal_ingredient"]',
  MODAL_OVERLAY: '[data-cy="modal_overlay"]',
  INGREDIENT_MODAL_NAME: '[data-cy="ingredient_modal"] > .text_type_main-medium',
  BTN_CLOSE_MODAL: '[data-cy="btn_close_modal"]',
  NEW_ORDER_BTN: '[data-cy="new_order_btn"]',
  NEW_ORDER_NUMBER: '[data-cy="new_order_number"]',
};

// Проверка, что конструктор пустой
function checkEmptyConstructor() {
  cy.get(SELECTORS.BUN_CONSTRUCTOR_UP_CLEAR).should('exist');
  cy.get(SELECTORS.BUN_CONSTRUCTOR_DOWN_CLEAR).should('exist');
  cy.get(SELECTORS.INGREDIENT_CONSTRUCTOR_ITEM).should('not.exist');
}

describe('Проверяем доступность приложения', () => {
  it('сервис должен быть доступен по адресу localhost:4000', () => {
    cy.visit(testUrl);
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

  cy.visit(testUrl);
  cy.wait('@getIngredients');
  cy.wait('@getUser');
});

afterEach('Очистка localStorage и Cookies', () => {
  cy.clearAllLocalStorage();
  cy.clearAllCookies();
});

describe('Проверка работоспособности страницы - ConstructorPage', () => {
  it('Проверка добавления ингредиентов в конструктор', () => {
    checkEmptyConstructor();

    cy.get(SELECTORS.BUN_0).should('exist').find('.common_button').click();
    cy.get(SELECTORS.INGREDIENT_0).should('exist').find('.common_button').click();

    cy.get(SELECTORS.BUN_CONSTRUCTOR_UP).should('exist');
    cy.get(SELECTORS.BUN_CONSTRUCTOR_DOWN).should('exist');
    cy.get(SELECTORS.INGREDIENT_CONSTRUCTOR_ITEM).should('exist');
  });

  it('Проверка открытия и закрытия модального окна через оверлей', () => {
    const ingredientName = 'Краторная булка N-200i';

    cy.get(SELECTORS.MODAL_INGREDIENT).should('not.exist');
    cy.get(SELECTORS.BUN_0).click();
    cy.get(SELECTORS.MODAL_INGREDIENT).should('be.visible');
    cy.get(SELECTORS.INGREDIENT_MODAL_NAME).should('contain.text', ingredientName);
    cy.get(SELECTORS.MODAL_OVERLAY).click({ force: true });
    cy.get(SELECTORS.MODAL_INGREDIENT).should('not.exist');
  });

  it('Проверка открытия и закрытия модального окна через кнопку закрытия', () => {
    const ingredientName = 'Краторная булка N-200i';

    cy.get(SELECTORS.MODAL_INGREDIENT).should('not.exist');
    cy.get(SELECTORS.BUN_0).should('exist').click();
    cy.get(SELECTORS.MODAL_INGREDIENT).should('be.visible');
    cy.get(SELECTORS.INGREDIENT_MODAL_NAME).should('contain.text', ingredientName);
    cy.get(SELECTORS.BTN_CLOSE_MODAL).click();
    cy.get(SELECTORS.MODAL_INGREDIENT).should('not.exist');
  });

  it('Проверка полного цикла заказа товара', () => {
    checkEmptyConstructor();

    cy.get(SELECTORS.BUN_0).should('exist').find('.common_button').click();
    cy.get(SELECTORS.INGREDIENT_0).should('exist').find('.common_button').click();

    cy.intercept('POST', 'api/orders', {
      fixture: 'newOrder'
    }).as('newOrder');

    cy.get(SELECTORS.NEW_ORDER_BTN).click();
    cy.wait('@newOrder');
    cy.fixture('newOrder').then((newOrder) => {
      cy.get(SELECTORS.NEW_ORDER_NUMBER).contains(newOrder.order.number);
    });

    cy.wait(1000);

    checkEmptyConstructor();
    cy.get(SELECTORS.BTN_CLOSE_MODAL).should('exist').click();
  });
});
