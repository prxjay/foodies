import { createContext, useEffect, useState } from "react";
import { fetchFoodList } from "../service/foodService";
import axios from "axios";
import {
  addToCart,
  getCartData,
  removeQtyFromCart,
} from "../service/cartService";

export const StoreContext = createContext(null);

export const StoreContextProvider = (props) => {
  const [foodList, setFoodList] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [token, setToken] = useState("");

  const increaseQty = async (foodId) => {
    setQuantities((prev) => ({ ...prev, [foodId]: (prev[foodId] || 0) + 1 }));
    await addToCart(foodId, token);
  };

  const decreaseQty = async (foodId) => {
    setQuantities((prev) => ({
      ...prev,
      [foodId]: prev[foodId] > 0 ? prev[foodId] - 1 : 0,
    }));
    await removeQtyFromCart(foodId, token);
  };

  const removeFromCart = (foodId) => {
    setQuantities((prevQuantities) => {
      const updatedQuantitites = { ...prevQuantities };
      delete updatedQuantitites[foodId];
      return updatedQuantitites;
    });
  };

  const loadCartData = async (token) => {
    try {
      const items = await getCartData(token);
      setQuantities(items || {});
    } catch (error) {
      console.error('Error loading cart data:', error);
      setQuantities({});
    }
  };

  const contextValue = {
    foodList,
    increaseQty,
    decreaseQty,
    quantities: quantities || {},
    removeFromCart,
    token,
    setToken,
    setQuantities,
    loadCartData,
  };

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchFoodList();
        setFoodList(data || []);
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken);
          await loadCartData(storedToken);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        setFoodList([]);
      }
    }
    loadData();
  }, []);

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
