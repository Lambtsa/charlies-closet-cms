import React, { useEffect, useState, useContext } from 'react';
import { ValidationContext } from '../hooks/ValidationContext';

/*
  Components
*/
import AccountNavigation from '../components/AccountNavigation';
import ItemCard from '../components/ItemCard';
import Loader from '../components/validation/Loader';
import PopupModal from '../components/PopupModal';

const Items = () => {
  const [items, setItems] = useState<any>([]);
  const { setError, setIsValid, setValidationMessage } = useContext(ValidationContext);
  const token = JSON.parse(localStorage.token);
  const [isLoading, setIsLoading] = useState(true);
  const [checkValidation, setCheckValidation] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  useEffect(() => {
    fetch('http://localhost:8080/api/items')
      .then(response => {
        if (!response.ok) {
          throw new Error('There has been an error getting the items');
        }
        return response.json();
      })
      .then(data => setItems(data))
      .catch((error) => {
        setError(true);
        setValidationMessage(error.message);
      })
      .finally(() => setIsLoading(false));
      /* eslint-disable-next-line */
  }, []);

  const handleDeleteClick = (id: string) => {
    setDeleteItemId(id);
    setCheckValidation(true);
  };

  const handleCancelBtn = () => {
    setCheckValidation(false);
  }
  const handleValidateBtn = (id: string) => {
    setIsLoading(true);
    fetch(`http://localhost:8080/api/items/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    }).then(response => {
        if (!response.ok) {
          throw new Error('There has been an issue deleting this item');
        }
        setIsValid(true);
        setValidationMessage('Item deleted successfully');
      })
      .catch((error) => {
        setError(true);
        setValidationMessage(error.message)
      })
      .finally(() => setIsLoading(false))
    setCheckValidation(false);
  }

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    const filteredItems = items.sort((a: any, b: any) => {
      if (typeof a[`${filter}`] === 'number' || typeof a[`${filter}`] === 'number') {
        return a[`${filter}`] - b[`${filter}`];
      }
      return a[`${filter}`].localeCompare(b[`${filter}`]);
    });
    setItems(filteredItems);
  };

  const filters: any = {
    itemTitle: 'titre',
    itemPrice: 'prix',
    itemSize: 'taille',
    itemCategory: 'catégorie',
    itemSeason: 'saison',
  }

  return (
    <>
      <AccountNavigation>
        {isLoading && <Loader />}
        {!isLoading && (
          <div className="list__container">
            <h1 className="form__title">Items</h1>
            <div className="filters__container">
              <div className="filters">
                {Object.keys(filters).map((filter: string, index: number) => (
                  <button
                    key={index}
                    className={`filters__btn ${activeFilter === filter ? 'active' : ''}`}
                    type="button"
                    onClick={() => handleFilterClick(filter)}>
                      {`Par ${filters[filter]}`}
                  </button>
                ))}
              </div>
              <button className="filters__add" type="button">Add</button>
            </div>
            {items.length > 0 && items.map((item: any) => (
              <ItemCard handleDeleteClick={handleDeleteClick} key={item._id} itemObj={item} />
            ))}
          </div>
        )}
        {checkValidation && (
          <PopupModal
            id={deleteItemId}
            handleCancelBtn={handleCancelBtn}
            handleValidateBtn={handleValidateBtn}
            cancelText="cancel"
            validateText="confirm"
            popupMessage="Are you sure you want to delete this item?" />
        )}
      </AccountNavigation>
    </>
  )
};

export default Items;
