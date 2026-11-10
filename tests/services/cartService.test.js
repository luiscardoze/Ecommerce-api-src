// ======================================================
// 1. MOCKS DE LOS MODELOS
// ======================================================

// jest.mock() reemplaza temporalmente los modelos reales
// por objetos simulados para no consultar la base de datos.

jest.mock('../../models/cart', () => ({
  create: jest.fn(),   // Simula la creación de un carrito
  findByPk: jest.fn()  // Simula la búsqueda de un carrito por ID
}));

jest.mock('../../models/cartItem', () => ({
  findOne: jest.fn(),  // Busca un artículo específico
  findAll: jest.fn(),  // Busca todos los artículos del carrito
  create: jest.fn(),   // Simula agregar un artículo
  findByPk: jest.fn()  // Busca un artículo por su ID
}));

jest.mock('../../models/product', () => ({
  findByPk: jest.fn()  // Busca un producto por su ID
}));

// ======================================================
// 2. IMPORTAR SERVICIOS Y MODELOS
// ======================================================

// Importamos el servicio que queremos probar.
const CartService = require('../../services/cartService');

// Importamos los modelos simulados para configurar
// sus respuestas y verificar si fueron utilizados.
const Cart = require('../../models/cart');
const CartItem = require('../../models/cartItem');
const Product = require('../../models/product');

// ======================================================
// 3. SUITE PRINCIPAL
// ======================================================

describe('CartService', () => {

  // beforeEach se ejecuta antes de cada prueba.
  // Limpia el historial de llamadas de los mocks.
  // No elimina las implementaciones de los mocks.

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ====================================================
  // CP01 - CREAR UN CARRITO
  // ====================================================

  describe('createCart', () => {

    it('CP01 - [Válida] should create a new cart', async () => {

      // Arrange: preparamos el resultado simulado.
      const mockCart = {
        id: 1,
        userId: 100
      };

      // Cuando se llame Cart.create(), devolverá mockCart.
      Cart.create.mockResolvedValue(mockCart);

      // Act: ejecutamos el método que queremos probar.
      const result = await CartService.createCart(100);

      // Assert: verificamos que se llamó al modelo
      // con el identificador del usuario correcto.
      expect(Cart.create).toHaveBeenCalledWith({
        userId: 100
      });

      // Verificamos el resultado completo.
      expect(result).toEqual(mockCart);

      // Verificamos que el carrito pertenece al usuario 100.
      expect(result.userId).toBe(100);
    });
  });

  // ====================================================
  // CP02 AL CP07 - AGREGAR PRODUCTOS AL CARRITO
  // ====================================================

  describe('addItemToCart', () => {

    // Datos simulados que se reutilizan en las pruebas.
    const mockProduct = {
      id: 1,
      inventory: 10,
      price: 100
    };

    const mockCartItem = {
      cartId: 1,
      productId: 1,
      quantity: 2
    };

    // --------------------------------------------------
    // CP02 - AGREGAR PRODUCTO EXISTENTE
    // Clase: Válida
    // --------------------------------------------------

    it('CP02 - [Válida] should add new item to cart when product exists and has sufficient inventory', async () => {

      // Arrange: el producto existe.
      Product.findByPk.mockResolvedValue(mockProduct);

      // El producto todavía no está en el carrito.
      CartItem.findOne.mockResolvedValue(null);

      // Simulamos la creación del artículo.
      CartItem.create.mockResolvedValue(mockCartItem);

      // Act: agregamos 2 unidades del producto 1 al carrito 1.
      const result = await CartService.addItemToCart(1, 1, 2);

      // Assert: verificamos que se buscó el producto.
      expect(Product.findByPk).toHaveBeenCalledWith(1);

      // Verificamos que se creó el artículo con los datos correctos.
      expect(CartItem.create).toHaveBeenCalledWith({
        cartId: 1,
        productId: 1,
        quantity: 2
      });

      // Verificamos el resultado.
      expect(result).toEqual(mockCartItem);
      expect(result.quantity).toBe(2);
    });

    // --------------------------------------------------
    // CP03 - PRODUCTO INEXISTENTE
    // Clase: Inválida
    // --------------------------------------------------

    it('CP03 - [Inválida] should reject adding a product that does not exist', async () => {

      // Arrange: simulamos que el producto 9999 no existe.
      Product.findByPk.mockResolvedValue(null);

      // Act + Assert:
      // Esperamos que el servicio genere un error.
      await expect(
        CartService.addItemToCart(1, 9999, 1)
      ).rejects.toThrow('Product not found');

      // Comprobamos que no se intentó crear el artículo.
      expect(CartItem.create).not.toHaveBeenCalled();
    });

    // --------------------------------------------------
    // CP04 - CANTIDAD IGUAL A CERO
    // Clase: Inválida
    // --------------------------------------------------

    it('CP04 - [Inválida] should reject quantity equal to zero', async () => {

      // El producto existe, pero la cantidad no cumple la regla del README.
      Product.findByPk.mockResolvedValue(mockProduct);
      CartItem.findOne.mockResolvedValue(null);
      CartItem.create.mockResolvedValue(mockCartItem);

      // La especificación exige rechazar cero unidades.
      await expect(
        CartService.addItemToCart(1, 1, 0)
      ).rejects.toThrow('Quantity must be a positive integer');

      // El artículo no debe persistirse si la regla se cumple.
      expect(CartItem.create).not.toHaveBeenCalled();
    });

    // --------------------------------------------------
    // CP05 - CANTIDAD NEGATIVA
    // Clase: Inválida
    // --------------------------------------------------

    it('CP05 - [Inválida] should reject negative quantity', async () => {

      Product.findByPk.mockResolvedValue(mockProduct);
      CartItem.findOne.mockResolvedValue(null);
      CartItem.create.mockResolvedValue(mockCartItem);

      // La especificación exige rechazar cantidades negativas.
      await expect(
        CartService.addItemToCart(1, 1, -2)
      ).rejects.toThrow('Quantity must be a positive integer');

      // El artículo no debe persistirse si la regla se cumple.
      expect(CartItem.create).not.toHaveBeenCalled();
    });

    // --------------------------------------------------
    // CP06 - CANTIDAD SUPERIOR AL INVENTARIO
    // Clase: Límite
    // --------------------------------------------------

    it('CP06 - [Límite] should reject quantity greater than available inventory', async () => {

      // Inventario disponible: 10 unidades.
      Product.findByPk.mockResolvedValue(mockProduct);

      // Solicitamos 11 unidades.
      await expect(
        CartService.addItemToCart(1, 1, 11)
      ).rejects.toThrow('Not enough inventory available');

      // No debe crearse el artículo.
      expect(CartItem.create).not.toHaveBeenCalled();
    });

    // --------------------------------------------------
    // CP07 - ACUMULACIÓN SUPERIOR AL INVENTARIO
    // Clase: Límite
    // --------------------------------------------------

    it('CP07 - [Límite] should reject accumulated quantity greater than inventory', async () => {

      // El producto tiene 10 unidades disponibles.
      Product.findByPk.mockResolvedValue(mockProduct);

      // Ya existen 8 unidades del mismo producto en el carrito.
      const existingItem = {
        cartId: 1,
        productId: 1,
        quantity: 8,
        save: jest.fn()
      };

      CartItem.findOne.mockResolvedValue(existingItem);

      // Intentamos agregar 3 unidades adicionales.
      // 8 + 3 = 11, pero solamente existen 10.
      await expect(
        CartService.addItemToCart(1, 1, 3)
      ).rejects.toThrow('Not enough inventory available');

      // La cantidad original debe mantenerse.
      expect(existingItem.quantity).toBe(8);

      // No debe guardarse la modificación.
      expect(existingItem.save).not.toHaveBeenCalled();
    });

    // --------------------------------------------------
    // CP13 - ACUMULACIÓN VÁLIDA EN UN ÍTEM EXISTENTE
    // Clase: Válida
    // --------------------------------------------------
    it('CP13 - [Válida] should accumulate quantity when the resulting total stays within inventory', async () => {
      Product.findByPk.mockResolvedValue(mockProduct);
      const existingItem = {
        cartId: 1,
        productId: 1,
        quantity: 3,
        save: jest.fn().mockResolvedValue(true)
      };
      CartItem.findOne.mockResolvedValue(existingItem);

      const result = await CartService.addItemToCart(1, 1, 2);

      expect(existingItem.quantity).toBe(5);
      expect(existingItem.save).toHaveBeenCalledTimes(1);
      expect(result).toBe(existingItem);
    });

    // --------------------------------------------------
    // CP12 - CANTIDAD LÍMITE + PRODUCTO INEXISTENTE
    // Clase: Inválida | Cruce: Carrito + Productos
    // --------------------------------------------------
    it('CP12 - [Inválida] should reject quantity zero when the product identifier does not exist', async () => {
      // Se combinan dos condiciones inválidas: productId inexistente y quantity = 0.
      // El servicio consulta primero el producto; por eso el error esperado
      // con la implementación actual es Product not found.
      Product.findByPk.mockResolvedValue(null);

      await expect(
        CartService.addItemToCart(1, 9999, 0)
      ).rejects.toThrow('Product not found');

      expect(Product.findByPk).toHaveBeenCalledWith(9999);
      expect(CartItem.findOne).not.toHaveBeenCalled();
      expect(CartItem.create).not.toHaveBeenCalled();
    });
  });

  // ====================================================
  // CP08 Y CP09 - CONSULTAR EL CARRITO
  // ====================================================

  describe('getCartItems', () => {

    // --------------------------------------------------
    // CP08 - CONSULTAR CARRITO Y CALCULAR TOTALES
    // Clase: Válida
    // --------------------------------------------------

    it('CP08 - [Válida] should return cart items with calculated totals', async () => {

      // Simulamos el carrito.
      const mockCart = {
        id: 1,
        userId: 100
      };

      // Simulamos un artículo:
      // Precio = 100
      // Cantidad = 2
      // Impuesto = 7 %
      const mockItem = {
        quantity: 2,

        Product: {
          id: 1,
          price: 100,
          taxRate: 0.07
        },

        // Simula la conversión del modelo Sequelize a JSON.
        toJSON: jest.fn().mockReturnValue({
          cartId: 1,
          productId: 1,
          quantity: 2
        })
      };

      Cart.findByPk.mockResolvedValue(mockCart);
      CartItem.findAll.mockResolvedValue([mockItem]);

      // Act: consultamos los artículos del carrito 1.
      const result = await CartService.getCartItems(1);

      // Assert: verificamos que se consultó el carrito.
      expect(Cart.findByPk).toHaveBeenCalledWith(1);

      // Verificamos la consulta de sus artículos.
      expect(CartItem.findAll).toHaveBeenCalledWith({
        where: { cartId: 1 },
        include: Product
      });

      // Comprobamos los resultados.s
      expect(result.items).toHaveLength(1);

      // Subtotal: 2 x 100 = 200.
      expect(result.summary.subtotal).toBe(200);

      // Impuesto: 200 x 0.07 = 14.
      expect(result.summary.totalTax).toBeCloseTo(14);

      // Total: 200 + 14 = 214.
      expect(result.summary.total).toBe(214);

      // Verificamos también los importes individuales.
      expect(result.items[0].itemSubtotal).toBe(200);
      expect(result.items[0].itemTax).toBeCloseTo(14);
    });

    // --------------------------------------------------
    // CP09 - IDENTIFICADOR DE CARRITO NO NUMÉRICO
    // Clase: Inválida
    // --------------------------------------------------

    it('CP09 - [Inválida] should reject a non-numeric cart identifier', async () => {

      // Enviamos un identificador que contiene letras.
      // El servicio debe rechazarlo antes de consultar la BD.
      await expect(
        CartService.getCartItems('abc123')
      ).rejects.toThrow('Cart ID should be a number');

      // Confirmamos que no se consultó el carrito.
      expect(Cart.findByPk).not.toHaveBeenCalled();
    });
  });

  // ====================================================
  // PRUEBAS ORIGINALES DEL PROFESOR
  // Se conservan, aunque no forman parte de CP01-CP09.
  // ====================================================

  describe('updateCartItem', () => {

    it('should update cart item quantity when sufficient inventory', async () => {

      // Simulamos un artículo que tiene 2 unidades.
      const mockCartItem = {
        id: 1,
        quantity: 2,

        Product: {
          id: 1,
          inventory: 10
        },

        save: jest.fn().mockResolvedValue(true)
      };

      CartItem.findByPk.mockResolvedValue(mockCartItem);

      // Actualizamos la cantidad a 5.
      const result = await CartService.updateCartItem(1, 5);

      // Comprobamos que la cantidad cambió.
      expect(mockCartItem.quantity).toBe(5);

      // Comprobamos que se guardó el cambio.
      expect(mockCartItem.save).toHaveBeenCalled();

      expect(result).toBe(mockCartItem);
    });
  });

  describe('removeCartItem', () => {
    it('should remove cart item successfully', async () => {
      // Simulamos el artículo que se eliminará.
      const mockCartItem = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(true)
      };

      CartItem.findByPk.mockResolvedValue(mockCartItem);

      // Ejecutamos la eliminación.
      await CartService.removeCartItem(1);

      // Verificamos que se llamó al método destroy().
      expect(mockCartItem.destroy).toHaveBeenCalled();
    });
  });
});
