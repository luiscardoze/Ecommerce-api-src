// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
const Product = require('../models/product');
const Category = require('../models/category');
const {
  Op
} = require('sequelize');
class ProductService {
  static async getAllProducts() {
    if (stryMutAct_9fa48("0")) {
      {}
    } else {
      stryCov_9fa48("0");
      return await Product.findAll();
    }
  }
  static async getProductById(id) {
    if (stryMutAct_9fa48("1")) {
      {}
    } else {
      stryCov_9fa48("1");
      return await Product.findByPk(id);
    }
  }
  static async createProduct(product) {
    if (stryMutAct_9fa48("2")) {
      {}
    } else {
      stryCov_9fa48("2");
      // Check if category exists
      const category = await Category.findByPk(product.categoryId);
      if (stryMutAct_9fa48("5") ? false : stryMutAct_9fa48("4") ? true : stryMutAct_9fa48("3") ? category : (stryCov_9fa48("3", "4", "5"), !category)) {
        if (stryMutAct_9fa48("6")) {
          {}
        } else {
          stryCov_9fa48("6");
          throw new Error(stryMutAct_9fa48("7") ? `` : (stryCov_9fa48("7"), `Category with id ${product.categoryId} does not exist`));
        }
      }
      return await Product.create(product);
    }
  }
  static async updateProduct(id, product) {
    if (stryMutAct_9fa48("8")) {
      {}
    } else {
      stryCov_9fa48("8");
      // If categoryId is being updated, check if new category exists
      if (stryMutAct_9fa48("10") ? false : stryMutAct_9fa48("9") ? true : (stryCov_9fa48("9", "10"), product.categoryId)) {
        if (stryMutAct_9fa48("11")) {
          {}
        } else {
          stryCov_9fa48("11");
          const category = await Category.findByPk(product.categoryId);
          if (stryMutAct_9fa48("14") ? false : stryMutAct_9fa48("13") ? true : stryMutAct_9fa48("12") ? category : (stryCov_9fa48("12", "13", "14"), !category)) {
            if (stryMutAct_9fa48("15")) {
              {}
            } else {
              stryCov_9fa48("15");
              throw new Error(stryMutAct_9fa48("16") ? `` : (stryCov_9fa48("16"), `Category with id ${product.categoryId} does not exist`));
            }
          }
        }
      }
      return await Product.update(product, stryMutAct_9fa48("17") ? {} : (stryCov_9fa48("17"), {
        where: stryMutAct_9fa48("18") ? {} : (stryCov_9fa48("18"), {
          id
        })
      }));
    }
  }
  static async deleteProduct(id) {
    if (stryMutAct_9fa48("19")) {
      {}
    } else {
      stryCov_9fa48("19");
      return await Product.destroy(stryMutAct_9fa48("20") ? {} : (stryCov_9fa48("20"), {
        where: stryMutAct_9fa48("21") ? {} : (stryCov_9fa48("21"), {
          id
        })
      }));
    }
  }
  static async getProductsByCategory(categoryId, options = {}) {
    if (stryMutAct_9fa48("22")) {
      {}
    } else {
      stryCov_9fa48("22");
      const {
        sort,
        limit,
        offset
      } = options;
      const queryOptions = stryMutAct_9fa48("23") ? {} : (stryCov_9fa48("23"), {
        where: stryMutAct_9fa48("24") ? {} : (stryCov_9fa48("24"), {
          categoryId
        }),
        include: Category
      });

      // Add sorting if specified
      if (stryMutAct_9fa48("26") ? false : stryMutAct_9fa48("25") ? true : (stryCov_9fa48("25", "26"), sort)) {
        if (stryMutAct_9fa48("27")) {
          {}
        } else {
          stryCov_9fa48("27");
          queryOptions.order = stryMutAct_9fa48("28") ? [] : (stryCov_9fa48("28"), [sort.split(stryMutAct_9fa48("29") ? "" : (stryCov_9fa48("29"), ','))]); // e.g. "price,DESC"
        }
      }

      // Add pagination if specified
      if (stryMutAct_9fa48("31") ? false : stryMutAct_9fa48("30") ? true : (stryCov_9fa48("30", "31"), limit)) {
        if (stryMutAct_9fa48("32")) {
          {}
        } else {
          stryCov_9fa48("32");
          queryOptions.limit = parseInt(limit);
        }
      }
      if (stryMutAct_9fa48("34") ? false : stryMutAct_9fa48("33") ? true : (stryCov_9fa48("33", "34"), offset)) {
        if (stryMutAct_9fa48("35")) {
          {}
        } else {
          stryCov_9fa48("35");
          queryOptions.offset = parseInt(offset);
        }
      }
      return await Product.findAll(queryOptions);
    }
  }
  static async getProductsByCategories(categoryIdsStr, options = {}) {
    if (stryMutAct_9fa48("36")) {
      {}
    } else {
      stryCov_9fa48("36");
      // Get categories from query parameter: ?categories=1,2,3
      const categoryIds = categoryIdsStr ? categoryIdsStr.split(stryMutAct_9fa48("37") ? "" : (stryCov_9fa48("37"), ',')).map(stryMutAct_9fa48("38") ? () => undefined : (stryCov_9fa48("38"), id => parseInt(id))) : stryMutAct_9fa48("39") ? ["Stryker was here"] : (stryCov_9fa48("39"), []);
      if (stryMutAct_9fa48("42") ? false : stryMutAct_9fa48("41") ? true : stryMutAct_9fa48("40") ? categoryIds.length : (stryCov_9fa48("40", "41", "42"), !categoryIds.length)) {
        if (stryMutAct_9fa48("43")) {
          {}
        } else {
          stryCov_9fa48("43");
          throw new Error(stryMutAct_9fa48("44") ? "" : (stryCov_9fa48("44"), 'Categories parameter is required'));
        }
      }
      const {
        sort,
        limit,
        offset
      } = options;
      const queryOptions = stryMutAct_9fa48("45") ? {} : (stryCov_9fa48("45"), {
        where: stryMutAct_9fa48("46") ? {} : (stryCov_9fa48("46"), {
          categoryId: stryMutAct_9fa48("47") ? {} : (stryCov_9fa48("47"), {
            [Op.in]: Array.isArray(categoryIds) ? categoryIds : stryMutAct_9fa48("48") ? [] : (stryCov_9fa48("48"), [categoryIds])
          })
        }),
        include: Category
      });

      // Add sorting if specified
      if (stryMutAct_9fa48("50") ? false : stryMutAct_9fa48("49") ? true : (stryCov_9fa48("49", "50"), sort)) {
        if (stryMutAct_9fa48("51")) {
          {}
        } else {
          stryCov_9fa48("51");
          queryOptions.order = stryMutAct_9fa48("52") ? [] : (stryCov_9fa48("52"), [sort.split(stryMutAct_9fa48("53") ? "" : (stryCov_9fa48("53"), ','))]);
        }
      }

      // Add pagination if specified
      if (stryMutAct_9fa48("55") ? false : stryMutAct_9fa48("54") ? true : (stryCov_9fa48("54", "55"), limit)) {
        if (stryMutAct_9fa48("56")) {
          {}
        } else {
          stryCov_9fa48("56");
          queryOptions.limit = parseInt(limit);
        }
      }
      if (stryMutAct_9fa48("58") ? false : stryMutAct_9fa48("57") ? true : (stryCov_9fa48("57", "58"), offset)) {
        if (stryMutAct_9fa48("59")) {
          {}
        } else {
          stryCov_9fa48("59");
          queryOptions.offset = parseInt(offset);
        }
      }
      return await Product.findAll(queryOptions);
    }
  }
}
module.exports = ProductService;