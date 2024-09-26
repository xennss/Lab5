const baseURL = "http://localhost:4000/customers";

export async function getAll(setCustomers) {
  const myInit = {
    method: "GET",
    mode: "cors",
  };
  const fetchData = async (url) => {
    try {
      const response = await fetch(url, myInit);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.status}`);
      }
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      alert(error);
    }
  };
  fetchData(baseURL);
}

export function deleteById(id, postOpCallback) {
  const header = {
    method: "DELETE",
    mode: "cors",
  };

  const deleteDataById = async (url) => {
    try {
      const response = await fetch(url, header);
      if (!response.ok) {
        throw new Error(`Error deleting data: ${response.status}`);
      }
      postOpCallback();
    } catch (error) {
      alert(error);
    }
  };
  const deleteURL = baseURL + `/${id}`;
  deleteDataById(deleteURL);
}

export function post(item, postOpCallback) {
  const header = {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: item.name,
      email: item.email,
      password: item.password,
    }),
  };

  const postData = async (url) => {
    try {
      const response = await fetch(url, header);
      if (!response.ok) {
        throw new Error(`Error posting data: ${response.status}`);
      }

      postOpCallback();
    } catch (error) {
      alert(error);
    }
  };

  postData(baseURL);
}

export function put(id, item, postOpCallback) {
  const header = {
    method: "PUT",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: item.name,
      email: item.email,
      password: item.password,
    }),
  };

  const postData = async (url) => {
    try {
      const response = await fetch(url, header);
      if (!response.ok) {
        throw new Error(`Error posting data: ${response.status}`);
      }

      postOpCallback();
    } catch (error) {
      alert(error);
    }
  };
  const putURL = baseURL + `/${id}`;
  postData(putURL);
}
