import React, { useMemo, useState } from 'react';
import './App.scss';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

export const App = () => {
  const [query, setQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  const products = useMemo(() => {
    return productsFromServer.map(product => {
      const category = categoriesFromServer.find(
        c => c.id === product.categoryId,
      );
      const user = usersFromServer.find(u => u.id === category?.ownerId);

      return { ...product, category, user };
    });
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesQuery = product.name
        .toLowerCase()
        .includes(query.toLowerCase().trim());
      const matchesUser =
        selectedUserId === 0 || product.user?.id === selectedUserId;
      const matchesCategory =
        selectedCategoryId.length === 0 ||
        selectedCategoryId.includes(product.categoryId);

      return matchesQuery && matchesCategory && matchesUser;
    });
  }, [products, query, selectedUserId, selectedCategoryId]);

  const sortedProducts = useMemo(() => {
    if (!sortField || !sortOrder) return filteredProducts;

    return [...filteredProducts].sort((a, b) => {
      let valA;
      let valB;

      switch (sortField) {
        case 'id':
          valA = a.id;
          valB = b.id;
          break;
        case 'name':
          valA = a.name;
          valB = b.name;
          break;
        case 'category':
          valA = a.category?.title || '';
          valB = b.category?.title || '';
          break;
        case 'user':
          valA = a.user?.name || '';
          valB = b.user?.name || '';
          break;
        default:
          return 0;
      }

      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredProducts, sortField, sortOrder]);

  const handleSort = field => {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortField(null);
      setSortOrder(null);
    }
  };

  const toggleCategory = id => {
    setSelectedCategoryId(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id],);
  };

  const resetFilters = () => {
    setQuery('');
    setSelectedUserId(0);
    setSelectedCategoryId([]);
    setSortField(null);
    setSortOrder(null);
  };

  const getSortIcon = field => {
    if (sortField !== field) return 'fa-sort';

    return sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>
            <p className="panel-tabs has-text-weight-bold">
              <a
                className={selectedUserId === 0 ? 'is-active' : ''}
                onClick={() => setSelectedUserId(0)}
                data-cy="FilterAllUsers"
                href="#/"
              >
                All
              </a>
              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  className={selectedUserId === user.id ? 'is-active' : ''}
                  onClick={() => setSelectedUserId(user.id)}
                  href="#/"
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                <span className="icon is-left">
                  <i className="fas fa-search" />
                </span>
                {query && (
                  <span className="icon is-right">
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={`button mr-6 ${selectedCategoryId.length === 0 ? 'is-success' : 'is-success is-outlined'}`}
                onClick={() => setSelectedCategoryId([])}
              >
                All
              </a>
              {categoriesFromServer.map(cat => (
                <a
                  key={cat.id}
                  data-cy="Category"
                  className={`button mr-2 my-1 ${selectedCategoryId.includes(cat.id) ? 'is-info' : ''}`}
                  href="#/"
                  onClick={e => {
                    e.preventDefault();
                    toggleCategory(cat.id);
                  }}
                >
                  {cat.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={resetFilters}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {sortedProducts.length === 0 ? (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          ) : (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {['id', 'name', 'category', 'user'].map(field => (
                    <th
                      key={field}
                      onClick={() => handleSort(field)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="is-flex is-flex-wrap-nowrap">
                        {field === 'id'
                          ? 'ID'
                          : field.charAt(0).toUpperCase() + field.slice(1)}
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={`fas ${getSortIcon(field)}`}
                          />
                        </span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map(product => (
                  <tr key={product.id} data-cy="Product">
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>
                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">{`${product.category?.icon} - ${product.category?.title}`}</td>
                    <td
                      data-cy="ProductUser"
                      className={
                        product.user?.sex === 'm'
                          ? 'has-text-link'
                          : 'has-text-danger'
                      }
                    >
                      {product.user?.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
