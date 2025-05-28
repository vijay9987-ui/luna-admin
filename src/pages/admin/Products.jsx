import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const initialProduct = {
  name: '',
  description: '',
  categoryName: '',
  subcategoryName: '',
  price: '',
  originalPrice: '',
  stock: '',
  isTrending: false,
  sizes: '',
  colors: '',
  images: [], // This will store URLs of uploaded images
  newImageFiles: [], // This will temporarily store file objects for new uploads
};

const API_BASE_URL = 'http://194.164.148.244:4066/api/products';

const Products = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(initialProduct);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(5);
  const [totalProducts, setTotalProducts] = useState(0);
  const [uploading, setUploading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/getproducts`);
      setProducts(response.data);
      setTotalProducts(response.data.length);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch products');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setCurrentProduct((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      // For immediate display, add files to newImageFiles
      setCurrentProduct(prev => ({
        ...prev,
        newImageFiles: [...prev.newImageFiles, ...files],
        // Also add temporary local URLs for immediate preview if desired (optional)
        // images: [...prev.images, ...files.map(file => URL.createObjectURL(file))]
      }));

      // No need to upload images separately here. They will be uploaded with the product form.
      // This part was a bit redundant with how `handleSaveProduct` is structured.
      toast.success('Images selected for upload. Click "Add/Update Product" to save them.');
    } catch (error) {
      toast.error('Error selecting images.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setCurrentProduct(prev => {
      // Check if the image to remove is an existing URL or a new file
      const updatedImages = prev.images.filter((_, i) => i !== indexToRemove);
      const updatedNewImageFiles = prev.newImageFiles.filter((_, i) => (prev.images.length + i) !== indexToRemove); // This logic might need refinement if you combine them in `images` state

      // Simplest approach: if the image at indexToRemove is a URL, filter from images.
      // If it's a file from newImageFiles, filter from there.
      // A more robust solution might combine images and newImageFiles into one array for display,
      // but keep them separate for form submission.
      if (indexToRemove < prev.images.length) {
        return {
          ...prev,
          images: updatedImages,
        };
      } else {
        return {
          ...prev,
          newImageFiles: prev.newImageFiles.filter((_, i) => i !== (indexToRemove - prev.images.length)),
        };
      }
    });
  };


  const handleSaveProduct = async () => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('name', currentProduct.name);
      formData.append('description', currentProduct.description);
      formData.append('categoryName', currentProduct.categoryName);
      formData.append('subcategoryName', currentProduct.subcategoryName);
      formData.append('price', currentProduct.price);
      formData.append('originalPrice', currentProduct.originalPrice || currentProduct.price);
      formData.append('stock', currentProduct.stock);
      formData.append('isTrending', currentProduct.isTrending);
      formData.append('sizes', currentProduct.sizes);
      formData.append('colors', currentProduct.colors);

      // Append existing image URLs (strings)
      currentProduct.images.forEach(imageUrl => {
        formData.append('existingImages', imageUrl); // Send as a separate field or combine later on backend
      });

      // Append new image files (File objects)
      currentProduct.newImageFiles.forEach(file => {
        formData.append('images', file); // 'images' should match your backend's expected field name for file uploads
      });

      if (currentProduct._id) {
        await axios.put(`${API_BASE_URL}/updateproducts/${currentProduct._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/create-product`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Product created successfully');
      }

      fetchProducts();
      setShowModal(false);
      setCurrentProduct(initialProduct); // Reset to initial state
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save product');
    } finally {
      setUploading(false);
    }
  };


  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_BASE_URL}/deleteproducts/${id}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0 text-primary">Product Management</h1>
        <button
          onClick={() => {
            setCurrentProduct(initialProduct);
            setShowModal(true);
          }}
          className="btn btn-primary"
          style={{ background: "linear-gradient(to right, #A66CFF, #9C9EFE)", color: "white" }}
        >
          <i className="fas fa-plus me-2"></i>Add Product
        </button>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="card shadow-sm border-0">
            <div className="card-header py-3" style={{ background: "linear-gradient(to right, #A66CFF, #9C9EFE)", color: "white" }}>
              <h5 className="mb-0">Products List</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th width="20%">Name</th>
                      <th width="15%">Category</th>
                      <th width="15%">Subcategory</th>
                      <th width="10%">Price</th>
                      <th width="10%">Original</th>
                      <th width="8%">Stock</th>
                      <th width="8%">Trending</th>
                      <th width="14%" className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.length > 0 ? (
                      currentProducts.map((product) => (
                        <tr key={product._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              {product.images?.[0] && (
                                <img
                                  src={
                                    product.images?.[0]?.startsWith('http')
                                      ? product.images[0]
                                      : `http://194.164.148.244:4066${product.images?.[0]}`
                                  }
                                  alt={product.name}
                                  className="rounded me-3"
                                  style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                />

                              )}
                              <span className="fw-medium">{product.name}</span>
                            </div>
                          </td>
                          <td>{product.categoryName}</td>
                          <td>{product.subcategoryName}</td>
                          <td className="text-success fw-medium">${product.price?.toFixed(2)}</td>
                          <td>
                            {product.originalPrice ? (
                              <span className="text-decoration-line-through text-muted">
                                ${product.originalPrice.toFixed(2)}
                              </span>
                            ) : '-'}
                          </td>
                          <td>
                            <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                              {product.stock}
                            </span>
                          </td>
                          <td>
                            <span className={`badge rounded-pill ${product.isTrending ? 'bg-success' : 'bg-secondary'}`}>
                              {product.isTrending ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="btn-group" role="group">
                              <button
                                onClick={() => {
                                  setCurrentProduct({
                                    ...product,
                                    sizes: product.sizes?.join(', ') || '',
                                    colors: product.colors?.join(', ') || '',
                                    newImageFiles: [], // Clear any pending new files when editing
                                  });
                                  setShowModal(true);
                                }}
                                className="btn btn-sm btn-outline-primary"
                                title="Edit"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                onClick={() => handleDelete(product._id)}
                                className="btn btn-sm btn-outline-danger"
                                title="Delete"
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <div className="text-muted">No products found</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {products.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="text-muted">
                Showing <span className="fw-medium">{indexOfFirstProduct + 1}</span> to{' '}
                <span className="fw-medium">{Math.min(indexOfLastProduct, totalProducts)}</span> of{' '}
                <span className="fw-medium">{totalProducts}</span> products
              </div>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      className="page-link"
                      disabled={currentPage === 1}
                    >
                      &laquo;
                    </button>
                  </li>
                  {Array.from(
                    { length: Math.ceil(products.length / productsPerPage) },
                    (_, i) => (
                      <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                        <button
                          onClick={() => paginate(i + 1)}
                          className="page-link"
                        >
                          {i + 1}
                        </button>
                      </li>
                    )
                  )}
                  <li className={`page-item ${currentPage === Math.ceil(products.length / productsPerPage) ? 'disabled' : ''}`}>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      className="page-link"
                      disabled={currentPage === Math.ceil(products.length / productsPerPage)}
                    >
                      &raquo;
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header" style={{ background: "linear-gradient(to right, #A66CFF, #9C9EFE)", color: "white" }}>
                <h5 className="modal-title">
                  {currentProduct._id ? 'Edit Product' : 'Add New Product'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row g-3">
                    {[
                      { label: 'Product Name', name: 'name', type: 'text', required: true },
                      { label: 'Category', name: 'categoryName', type: 'text', required: true },
                      { label: 'Subcategory', name: 'subcategoryName', type: 'text', required: true },
                      { label: 'Price ($)', name: 'price', type: 'number', required: true },
                      { label: 'Original Price ($)', name: 'originalPrice', type: 'number' },
                      { label: 'Stock Quantity', name: 'stock', type: 'number', required: true },
                      { label: 'Available Sizes (comma separated)', name: 'sizes', type: 'text' },
                      { label: 'Available Colors (comma separated)', name: 'colors', type: 'text' },
                    ].map((field, index) => (
                      <div key={index} className="col-md-6">
                        <label className="form-label">
                          {field.label}
                          {field.required && <span className="text-danger">*</span>}
                        </label>
                        <input
                          type={field.type}
                          name={field.name}
                          className="form-control"
                          value={currentProduct[field.name]}
                          onChange={handleInputChange}
                          required={field.required}
                        />
                      </div>
                    ))}
                    <div className="col-md-6">
                      <label className="form-label">Trending Product</label>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="isTrending"
                          checked={currentProduct.isTrending}
                          onChange={handleCheckboxChange}
                          style={{ width: '2.5em' }}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Product Description</label>
                      <textarea
                        name="description"
                        rows="3"
                        className="form-control"
                        value={currentProduct.description}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Product Images</label>
                      <div className="input-group mb-3">
                        <input
                          type="file"
                          className="form-control"
                          onChange={handleImageUpload}
                          multiple
                          accept="image/*"
                        />
                        {uploading && (
                          <span className="input-group-text bg-transparent">
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            ></span>
                            Processing images...
                          </span>
                        )}
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {/* Display existing images */}
                        {currentProduct.images?.map((image, index) => (
                          <div key={`existing-${index}`} className="position-relative" style={{ width: '100px' }}>
                            <img
                              src={image.startsWith('http') ? image : `http://194.164.148.244:4066${image}`}
                              alt={`Product ${index + 1}`}
                              className="img-thumbnail"
                              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            />
                            <button
                              type="button"
                              className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle"
                              onClick={() => removeImage(index)} // This needs to be able to remove from `images` state
                              style={{ width: '24px', height: '24px', transform: 'translate(50%, -50%)' }}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ))}
                        {/* Display newly selected images (from newImageFiles) */}
                        {currentProduct.newImageFiles?.map((file, index) => (
                          <div key={`new-${index}`} className="position-relative" style={{ width: '100px' }}>
                            <img
                              src={URL.createObjectURL(file)} // Create object URL for preview
                              alt={`New Product ${index + 1}`}
                              className="img-thumbnail"
                              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            />
                            <button
                              type="button"
                              className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle"
                              onClick={() => removeImage(currentProduct.images.length + index)} // Adjust index for new files
                              style={{ width: '24px', height: '24px', transform: 'translate(50%, -50%)' }}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveProduct}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Saving...
                    </>
                  ) : currentProduct._id ? (
                    'Update Product'
                  ) : (
                    'Add Product'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;