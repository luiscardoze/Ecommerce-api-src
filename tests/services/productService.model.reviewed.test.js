
jest.mock('../../models/product', () => ({
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    belongsTo: jest.fn()
}));

jest.mock('../../models/category', () => ({
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
}));

const Product = require('../../models/product');
const Category = require('../../models/category');
const { Op } = require('sequelize');
const ProductService = require('../../services/productService');

describe('ProductService - model tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllProducts', () => {
        it('should return all products returned by Product.findAll', async () => {
            const products = [
                { id: 1, name: 'Keyboard', price: 25 },
                { id: 2, name: 'Mouse', price: 15 }
            ];
            Product.findAll.mockResolvedValue(products);

            const result = await ProductService.getAllProducts();

            expect(result).toBe(products);
            expect(Product.findAll).toHaveBeenCalledTimes(1);
            expect(Product.findAll).toHaveBeenCalledWith();
        });
    });

    describe('getProductById', () => {
        it('should return the product matching the requested primary key', async () => {
            const product = { id: 7, name: 'Monitor', price: 180 };
            Product.findByPk.mockResolvedValue(product);

            const result = await ProductService.getProductById(7);

            expect(result).toBe(product);
            expect(Product.findByPk).toHaveBeenCalledTimes(1);
            expect(Product.findByPk).toHaveBeenCalledWith(7);
        });

        it('should return null when the product does not exist', async () => {
            Product.findByPk.mockResolvedValue(null);

            const result = await ProductService.getProductById(999);

            expect(result).toBeNull();
            expect(Product.findByPk).toHaveBeenCalledWith(999);
        });
    });

    describe('createProduct', () => {
        it('should create a product after confirming that its category exists', async () => {
            const newProduct = {
                name: 'USB Hub',
                price: 20,
                categoryId: 3
            };
            const category = { id: 3, name: 'Accessories' };
            const createdProduct = { id: 21, ...newProduct };

            Category.findByPk.mockResolvedValue(category);
            Product.create.mockResolvedValue(createdProduct);

            const result = await ProductService.createProduct(newProduct);

            expect(result).toBe(createdProduct);
            expect(Category.findByPk).toHaveBeenCalledTimes(1);
            expect(Category.findByPk).toHaveBeenCalledWith(3);
            expect(Product.create).toHaveBeenCalledTimes(1);
            expect(Product.create).toHaveBeenCalledWith(newProduct);
        });

        it('should reject and not create a product when its category does not exist', async () => {
            const newProduct = {
                name: 'USB Hub',
                price: 20,
                categoryId: 404
            };
            Category.findByPk.mockResolvedValue(null);

            await expect(ProductService.createProduct(newProduct))
                .rejects.toThrow('Category with id 404 does not exist');

            expect(Category.findByPk).toHaveBeenCalledWith(404);
            expect(Product.create).not.toHaveBeenCalled();
        });
    });

    describe('updateProduct', () => {
        it('should validate a supplied category and update the product', async () => {
            const productId = 8;
            const changes = { name: 'Updated monitor', categoryId: 5 };
            const updateResult = [1];

            Category.findByPk.mockResolvedValue({ id: 5, name: 'Displays' });
            Product.update.mockResolvedValue(updateResult);

            const result = await ProductService.updateProduct(productId, changes);

            expect(result).toBe(updateResult);
            expect(Category.findByPk).toHaveBeenCalledTimes(1);
            expect(Category.findByPk).toHaveBeenCalledWith(5);
            expect(Product.update).toHaveBeenCalledTimes(1);
            expect(Product.update).toHaveBeenCalledWith(changes, {
                where: { id: productId }
            });
        });

        it('should reject and leave the product unchanged when the supplied category does not exist', async () => {
            const productId = 8;
            const changes = { categoryId: 404, name: 'Invalid category' };
            Category.findByPk.mockResolvedValue(null);

            await expect(ProductService.updateProduct(productId, changes))
                .rejects.toThrow('Category with id 404 does not exist');

            expect(Category.findByPk).toHaveBeenCalledWith(404);
            expect(Product.update).not.toHaveBeenCalled();
        });

        it('should update a product without looking up a category when categoryId is omitted', async () => {
            const productId = 12;
            const changes = { name: 'New product name', price: 30 };
            const updateResult = [1];
            Product.update.mockResolvedValue(updateResult);

            const result = await ProductService.updateProduct(productId, changes);

            expect(result).toBe(updateResult);
            expect(Category.findByPk).not.toHaveBeenCalled();
            expect(Product.update).toHaveBeenCalledWith(changes, {
                where: { id: productId }
            });
        });
    });

    describe('deleteProduct', () => {
        it('should delete only the product matching the supplied id and return the affected-row count', async () => {
            Product.destroy.mockResolvedValue(1);

            const result = await ProductService.deleteProduct(14);

            expect(result).toBe(1);
            expect(Product.destroy).toHaveBeenCalledTimes(1);
            expect(Product.destroy).toHaveBeenCalledWith({
                where: { id: 14 }
            });
        });

        it('should return zero when no product matches the supplied id', async () => {
            Product.destroy.mockResolvedValue(0);

            const result = await ProductService.deleteProduct(999);

            expect(result).toBe(0);
            expect(Product.destroy).toHaveBeenCalledWith({
                where: { id: 999 }
            });
        });
    });

    describe('getProductsByCategory', () => {
        it('should filter by one category and include the Category model when no options are supplied', async () => {
            const products = [{ id: 1, categoryId: 2 }];
            Product.findAll.mockResolvedValue(products);

            const result = await ProductService.getProductsByCategory(2);

            expect(result).toBe(products);
            expect(Product.findAll).toHaveBeenCalledWith({
                where: { categoryId: 2 },
                include: Category
            });
        });

        it('should combine category filtering, sorting, limit, and offset', async () => {
            const products = [{ id: 9, categoryId: 4, price: 10 }];
            Product.findAll.mockResolvedValue(products);

            const result = await ProductService.getProductsByCategory(4, {
                sort: 'price,DESC',
                limit: '10',
                offset: '20'
            });

            expect(result).toBe(products);
            expect(Product.findAll).toHaveBeenCalledWith({
                where: { categoryId: 4 },
                include: Category,
                order: [['price', 'DESC']],
                limit: 10,
                offset: 20
            });
        });

        it('should apply only the options that are supplied', async () => {
            Product.findAll.mockResolvedValue([]);

            await ProductService.getProductsByCategory(6, {
                sort: 'name,ASC'
            });

            expect(Product.findAll).toHaveBeenCalledWith({
                where: { categoryId: 6 },
                include: Category,
                order: [['name', 'ASC']]
            });
        });

        it('should preserve a zero limit and zero offset when supplied as query strings', async () => {
            Product.findAll.mockResolvedValue([]);

            await ProductService.getProductsByCategory(6, {
                limit: '0',
                offset: '0'
            });

            expect(Product.findAll).toHaveBeenCalledWith({
                where: { categoryId: 6 },
                include: Category,
                limit: 0,
                offset: 0
            });
        });
    });

    describe('getProductsByCategories', () => {
        it('should reject when the categories parameter is missing or empty', async () => {
            await expect(ProductService.getProductsByCategories(''))
                .rejects.toThrow('Categories parameter is required');

            await expect(ProductService.getProductsByCategories(null))
                .rejects.toThrow('Categories parameter is required');

            expect(Product.findAll).not.toHaveBeenCalled();
        });

        it('should filter by multiple category ids using Sequelize Op.in', async () => {
            const products = [
                { id: 1, categoryId: 2 },
                { id: 2, categoryId: 3 }
            ];
            Product.findAll.mockResolvedValue(products);

            const result = await ProductService.getProductsByCategories('2,3');

            expect(result).toBe(products);
            expect(Product.findAll).toHaveBeenCalledWith({
                where: {
                    categoryId: {
                        [Op.in]: [2, 3]
                    }
                },
                include: Category
            });
        });

        it('should combine multiple categories with sorting and pagination', async () => {
            Product.findAll.mockResolvedValue([]);

            await ProductService.getProductsByCategories('1,4,7', {
                sort: 'createdAt,DESC',
                limit: '5',
                offset: '10'
            });

            expect(Product.findAll).toHaveBeenCalledWith({
                where: {
                    categoryId: {
                        [Op.in]: [1, 4, 7]
                    }
                },
                include: Category,
                order: [['createdAt', 'DESC']],
                limit: 5,
                offset: 10
            });
        });

        it('should apply sorting without adding pagination when limit and offset are omitted', async () => {
            Product.findAll.mockResolvedValue([]);

            await ProductService.getProductsByCategories('8,9', {
                sort: 'price,ASC'
            });

            expect(Product.findAll).toHaveBeenCalledWith({
                where: {
                    categoryId: {
                        [Op.in]: [8, 9]
                    }
                },
                include: Category,
                order: [['price', 'ASC']]
            });
        });

        it('should convert category ids and pagination values from query strings to integers', async () => {
            Product.findAll.mockResolvedValue([]);

            await ProductService.getProductsByCategories('02, 03', {
                limit: '12',
                offset: '4'
            });

            expect(Product.findAll).toHaveBeenCalledWith({
                where: {
                    categoryId: {
                        [Op.in]: [2, 3]
                    }
                },
                include: Category,
                limit: 12,
                offset: 4
            });
        });
    });
});