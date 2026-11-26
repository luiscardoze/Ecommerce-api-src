
// ======================================================
// 1. MOCKS DE LOS MODELOS
// ======================================================

// Reemplazamos el modelo Product por uno simulado.
// Así evitamos realizar consultas reales a la base de datos.

jest.mock('../../models/product', () => ({
  findAll: jest.fn(),   // Consultar varios productos
  findByPk: jest.fn(),  // Consultar producto por ID
  create: jest.fn(),    // Crear producto
  update: jest.fn(),    // Actualizar producto
  destroy: jest.fn(),   // Eliminar producto
  belongsTo: jest.fn()  // Simular asociación con categoría
}));

// Simulamos el modelo Category.
jest.mock('../../models/category', () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn()
}));

// ======================================================
// 2. IMPORTAR SERVICIO Y MODELOS
// ======================================================

const ProductService = require('../../services/productService');
const Product = require('../../models/product');
const Category = require('../../models/category');
const { Op } = require('sequelize');

// ======================================================
// 3. SUITE PRINCIPAL
// ======================================================

describe('ProductService', () => {

  // Se ejecuta antes de cada prueba.
  // Limpia el historial de llamadas de los mocks.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ====================================================
  // CP10 - CONSULTAR TODOS LOS PRODUCTOS
  // ====================================================

  describe('getAllProducts', () => {

    it('CP10 - [Válida] should return all products', async () => {

      // Arrange: preparamos tres productos simulados.
      const mockProducts = [
        { id: 1, name: 'Laptop', price: 1000 },
        { id: 2, name: 'Mouse', price: 25 },
        { id: 3, name: 'Keyboard', price: 50 }
      ];

      // Cuando el servicio consulte todos los productos,
      // el modelo devolverá nuestro arreglo.
      Product.findAll.mockResolvedValue(mockProducts);

      // Act: ejecutamos el método del servicio.
      const result = await ProductService.getAllProducts();

      // Assert: verificamos que se consultaron los productos.
      expect(Product.findAll).toHaveBeenCalled();

      // Verificamos que recibimos tres productos.
      expect(result).toHaveLength(3);

      // Comprobamos que los datos sean los esperados.
      expect(result).toEqual(mockProducts);
    });
  });

  // ====================================================
  // CP11 - CONSULTAR PRODUCTO POR IDENTIFICADOR
  // ====================================================

  describe('getProductById', () => {

    it('CP11 - [Válida] should return a product when product exists', async () => {

      // Arrange: simulamos un producto existente.
      const mockProduct = {
        id: 1,
        name: 'Laptop',
        price: 1000
      };

      Product.findByPk.mockResolvedValue(mockProduct);

      // Act: buscamos el producto con ID 1.
      const result = await ProductService.getProductById(1);

      // Assert: verificamos que se consultó el ID correcto.
      expect(Product.findByPk).toHaveBeenCalledWith(1);

      // Comprobamos el resultado.
      expect(result).toEqual(mockProduct);
      expect(result.id).toBe(1);
    });
  });

  // ====================================================
  // CP12 - CREAR PRODUCTO CON CATEGORÍA INEXISTENTE
  // Clase: Inválida
  // ====================================================

  describe('createProduct', () => {

    // Conservamos el escenario positivo del profesor
    // como una prueba adicional.
    it('should create a product when category exists', async () => {

      const mockProduct = {
        id: 1,
        name: 'Monitor',
        price: 200,
        categoryId: 1
      };

      // La categoría sí existe.
      Category.findByPk.mockResolvedValue({
        id: 1,
        name: 'Electronics'
      });

      Product.create.mockResolvedValue(mockProduct);

      const result = await ProductService.createProduct({
        name: 'Monitor',
        price: 200,
        categoryId: 1
      });

      expect(Category.findByPk).toHaveBeenCalledWith(1);
      expect(Product.create).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });

    // CP12 - Cruce de recursos: Producto + Categoría.
    it('AUX-PROD-01 - [Inválida] should reject creating a product with a non-existent category', async () => {

      // Datos del producto que queremos crear.
      const newProduct = {
        name: 'Monitor',
        price: 200,
        categoryId: 9999
      };

      // Simulamos que la categoría 9999 no existe.
      Category.findByPk.mockResolvedValue(null);

      // Act + Assert: esperamos que el servicio genere error.
      await expect(
        ProductService.createProduct(newProduct)
      ).rejects.toThrow(
        'Category with id 9999 does not exist'
      );

      // Comprobamos que se buscó la categoría correcta.
      expect(Category.findByPk).toHaveBeenCalledWith(9999);

      // No debe crearse el producto.
      expect(Product.create).not.toHaveBeenCalled();
    });
  });

  // ====================================================
  // CONSULTAR PRODUCTOS POR CATEGORÍA
  // Prueba adicional del profesor.
  // ====================================================

  describe('getProductsByCategory', () => {

    it('should return products by category', async () => {

      const mockProducts = [
        { id: 1, name: 'Laptop', categoryId: 1 }
      ];

      Product.findAll.mockResolvedValue(mockProducts);

      // Consultamos los productos de la categoría 1.
      const result = await ProductService.getProductsByCategory(1);

      // Comprobamos el resultado.
      expect(result).toEqual(mockProducts);

      // Verificamos los parámetros de consulta.
      expect(Product.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { categoryId: 1 }
        })
      );
    });

    it('should apply sorting, limit and offset when options are provided', async () => {
      // Este escenario ejecuta las ramas verdaderas de sort, limit y offset.
      Product.findAll.mockResolvedValue([]);

      const result = await ProductService.getProductsByCategory(1, {
        sort: 'price,DESC',
        limit: '5',
        offset: '10'
      });

      expect(result).toEqual([]);
      expect(Product.findAll).toHaveBeenCalledWith({
        where: { categoryId: 1 },
        include: Category,
        order: [['price', 'DESC']],
        limit: 5,
        offset: 10
      });
    });
  });

  // ====================================================
  // CONSULTAR PRODUCTOS DE VARIAS CATEGORÍAS
  // Prueba adicional del profesor.
  // ====================================================

  describe('getProductsByCategories', () => {

    it('should return products by categories', async () => {

      const mockProducts = [
        { id: 1, name: 'Laptop', categoryId: 1 },
        { id: 2, name: 'Mouse', categoryId: 2 }
      ];

      Product.findAll.mockResolvedValue(mockProducts);

      // Consultamos las categorías 1 y 2.
      const result = await ProductService.getProductsByCategories('1,2');

      expect(result).toEqual(mockProducts);

      // Comprobamos que se llamó al modelo.
      expect(Product.findAll).toHaveBeenCalled();
    });

    it('should build the correct query with categories, sorting and pagination', async () => {
      const mockProducts = [
        { id: 1, name: 'Laptop', categoryId: 1 },
        { id: 2, name: 'Mouse', categoryId: 2 }
      ];

      Product.findAll.mockResolvedValue(mockProducts);

      const result = await ProductService.getProductsByCategories('1,2', {
        sort: 'price,DESC',
        limit: '5',
        offset: '10'
      });

      expect(result).toEqual(mockProducts);

      expect(Product.findAll).toHaveBeenCalledWith({
        where: {
          categoryId: {
            [Op.in]: [1, 2]
          }
        },
        include: Category,
        order: [['price', 'DESC']],
        limit: 5,
        offset: 10
      });
    });
    it('should not include sorting or pagination when options are omitted', async () => {
      Product.findAll.mockResolvedValue([]);

      await ProductService.getProductsByCategories('1,2');

      expect(Product.findAll).toHaveBeenCalledWith({
        where: {
          categoryId: {
            [Op.in]: [1, 2]
          }
        },
        include: Category
      });
    });

    it('should apply sorting without pagination when only sort is provided', async () => {
      Product.findAll.mockResolvedValue([]);

      await ProductService.getProductsByCategories('1,2', {
        sort: 'name,ASC'
      });

      expect(Product.findAll).toHaveBeenCalledWith({
        where: {
          categoryId: {
            [Op.in]: [1, 2]
          }
        },
        include: Category,
        order: [['name', 'ASC']]
      });
    });

  });

  // ====================================================
  // ACTUALIZAR PRODUCTO
  // Prueba adicional del profesor.
  // ====================================================

  describe('updateProduct', () => {

    it('should update a product when the new category exists', async () => {
      const mockCategory = {
        id: 2,
        name: 'Electronics'
      };

      Category.findByPk.mockResolvedValue(mockCategory);
      Product.update.mockResolvedValue([1]);

      const productData = {
        name: 'Laptop actualizado',
        categoryId: 2
      };

      const result = await ProductService.updateProduct(1, productData);

      // Comprueba que se valide la categoría nueva.
      expect(Category.findByPk).toHaveBeenCalledWith(2);

      // Comprueba que se actualice el producto.
      expect(Product.update).toHaveBeenCalledWith(
        productData,
        { where: { id: 1 } }
      );

      expect(result).toEqual([1]);
    });

    it('should reject when the new category does not exist', async () => {
      Category.findByPk.mockResolvedValue(null);

      const productData = {
        name: 'Laptop actualizado',
        categoryId: 9999
      };

      await expect(
        ProductService.updateProduct(1, productData)
      ).rejects.toThrow(
        'Category with id 9999 does not exist'
      );

      // No debe actualizarse el producto.
      expect(Product.update).not.toHaveBeenCalled();
    });


    it('should update a product', async () => {

      // Sequelize devuelve un arreglo con la cantidad
      // de registros afectados por la actualización.
      Product.update.mockResolvedValue([1]);

      const result = await ProductService.updateProduct(1, {
        name: 'Laptop actualizado'
      });

      // Verificamos los datos y el identificador.
      expect(Product.update).toHaveBeenCalledWith(
        { name: 'Laptop actualizado' },
        { where: { id: 1 } }
      );

      expect(result).toEqual([1]);
    });

    it('should reject when the categories parameter is empty in getProductsByCategories', async () => {
      // La ausencia del parámetro produce una lista de categorías vacía.
      await expect(
        ProductService.getProductsByCategories('')
      ).rejects.toThrow('Categories parameter is required');

      expect(Product.findAll).not.toHaveBeenCalled();
    });
  });

  // ====================================================
  // ELIMINAR PRODUCTO
  // Prueba adicional del profesor.
  // ====================================================

  describe('deleteProduct', () => {

    it('should delete a product', async () => {

      // Simulamos que se eliminó un registro.
      Product.destroy.mockResolvedValue(1);

      // Ejecutamos la eliminación del producto 1.
      const result = await ProductService.deleteProduct(1);

      // Verificamos la consulta de eliminación.
      expect(Product.destroy).toHaveBeenCalledWith({
        where: { id: 1 }
      });

      // Confirmamos que se eliminó un registro.
      expect(result).toBe(1);
    });
  });


});
