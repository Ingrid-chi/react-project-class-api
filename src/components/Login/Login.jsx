import axios from 'axios';
import { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function Login() {
  // 使用者尚未登入時 false 維持登入頁面,使用者成功登入 true 再導入產品頁面
  const [isAuth, setIsAuth] = useState(false);

  const [tempProduct, setTempProduct] = useState({});
  const [products, setProducts] = useState([]);

  const [account, setAccount] = useState({
    username: 'ingrid.chi77@gmail.com',
    password: 'ingridapi',
  });

  const handleInputChange = (e) => {
    const { value, name } = e.target;

    setAccount({
      ...account,
      [name]: value,
    });
  };

  const handleLogin = (e) => {
    // 神秘事件 輸入完可以直接按 enter
    // 透過表單觸發 submit 事件，使用 e.preventDefault() 取消表單的預設行為
    e.preventDefault();
    // console.log(account);
    // console.log(import.meta.env.VITE_BASE_URL);
    // console.log(import.meta.env.VITE_API_PATH);
    axios
      .post(`${BASE_URL}/v2/admin/signin`, account)
      .then((res) => {
        // 把 token 跟過期日從 res 裡面的 data 解構出來
        const { token, expired } = res.data;
        // console.log(token, expired);
        // 把 token 跟 expires 存入 cookie
        document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;

        // 發送請求之前都要帶上 token (header)
        axios.defaults.headers.common['Authorization'] = token;

        axios
          .get(`${BASE_URL}/v2/api/${API_PATH}/admin/products`)
          .then((res) => setProducts(res.data.products))
          .catch((error) => console.log(error));

        // 登入成功後，會導入產品頁面
        setIsAuth(true);
      })
      .catch((error) => {
        console.log(error);
        alert('登入失敗');
      });
  };

  const checkUserLogin = () => {
    axios
      .post(`${BASE_URL}/v2/api/user/check`)
      .then((res) => {
        console.log(res);
        alert('使用者已登入');
      })
      .catch((error) => console.error(error));
  };

  // 改用 async await 的寫法
  // const checkUserLogin = async () => {
  //   try {
  //     await axios.post(`${BASE_URL}/v2/api/user/check`);
  //     alert('使用者已登入');
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  return (
    <>
      {isAuth ? (
        <div className='container'>
          <div className='row mt-5'>
            <div className='col-md-6'>
              <button
                onClick={checkUserLogin}
                className='btn btn-success mb-5'
                type='button'
              >
                檢查使用者是否登入
              </button>
              <h2>產品列表</h2>
              <table className='table'>
                <thead>
                  <tr>
                    <th>產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>是否啟用</th>
                    <th>查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products && products.length > 0 ? (
                    products.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.origin_price}</td>
                        <td>{item.price}</td>
                        <td>{item.is_enabled ? '啟用' : '未啟用'}</td>
                        <td>
                          <button
                            className='btn btn-primary'
                            onClick={() => setTempProduct(item)}
                          >
                            查看細節
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan='5'>尚無產品資料</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className='col-md-6'>
              <h2>單一產品細節</h2>
              {tempProduct ? (
                <div className='card mb-3'>
                  <img
                    src={tempProduct.imageUrl}
                    className='card-img-top primary-image'
                    alt='主圖'
                  />
                  <div className='card-body'>
                    <h5 className='card-title'>
                      {tempProduct.title}
                      <span className='badge bg-primary ms-2'>
                        {tempProduct.category}
                      </span>
                    </h5>
                    <p className='card-text'>
                      商品描述：{tempProduct.category}
                    </p>
                    <p className='card-text'>商品內容：{tempProduct.content}</p>
                    <div className='d-flex'>
                      <p className='card-text text-secondary'>
                        <del>{tempProduct.origin_price}</del>
                      </p>
                      元 / {tempProduct.price} 元
                    </div>
                    <h5 className='mt-3'>更多圖片：</h5>
                    <div className='d-flex flex-wrap'>
                      {tempProduct.imagesUrl?.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          className='images'
                          alt='副圖'
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className='text-secondary'>請選擇一個商品查看</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className='container login'>
          <div className='row justify-content-center'>
            <h1 className='h3 mb-3 font-weight-normal'>請先登入</h1>
            <div className='col-8'>
              <form id='form' className='form-signin' onSubmit={handleLogin}>
                <div className='form-floating mb-3'>
                  <input
                    name='username'
                    type='email'
                    className='form-control'
                    id='username'
                    placeholder='name@example.com'
                    value={account.username}
                    onChange={handleInputChange}
                    required
                    autoFocus
                  />
                  <label htmlFor='username'>Email address</label>
                </div>
                <div className='form-floating'>
                  <input
                    name='password'
                    type='password'
                    className='form-control'
                    id='password'
                    placeholder='Password'
                    value={account.password}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor='password'>Password</label>
                </div>
                {/* onClick 在 form 標籤上 */}
                <button className='btn btn-lg btn-primary w-100 mt-3'>
                  登入
                </button>
              </form>
            </div>
          </div>
          <p className='mt-5 mb-3 text-muted'>&copy; 2024~∞ - 六角學院</p>
        </div>
      )}
    </>
  );
}

export default Login;
