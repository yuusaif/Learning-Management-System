import { useState, useEffect, useContext } from 'react';
import API from '../../services/api';
import AdminLayout from '../../components/Admin/AdminLayout';
import { deleteContentById, updateContentById } from '../../services/contentsApi';
import { toast } from "react-toastify";
import ShowConfirmation from '../../components/Shared/ShowConfirmation';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../../context/AuthContext';


// Small reusable component for content input fields
const ContentFormFields = ({ content, index, handleChange, handleDelete }) => (
  <div className="mb-6 border p-4 rounded shadow">
    {[
      { label: 'Title', name: 'title', type: 'text' },
      { label: 'Content Type', name: 'content_type', type: 'text', disabled: true },
      { label: 'URL (optional)', name: 'url', type: 'url' },
      { label: 'Order', name: 'order', type: 'order' },
    ].map(({ label, name, type, disabled = false }) => (
      <div key={name}>
        <label className="block font-semibold mt-4 mb-1">{label}</label>
        <input
          type={type}
          name={name}
          value={content[name] || ''}
          onChange={(e) => handleChange(index, e)}
          className="p-2 border rounded w-full"
          disabled={disabled}
        />
      </div>
    ))}

    <label htmlFor='text_content' className="block font-semibold mt-4 mb-1">Text Content (optional)</label>
    <textarea
      name="text_content"
      id="text_content"
      value={content.text_content || ''}
      onChange={(e) => handleChange(index, e)}
      className="p-2 border rounded w-full"
      rows="4"
    />

    <div className="flex justify-end">
      <button
        type="button"
        onClick={() => handleDelete(content.id)}
        className="mt-4 bg-red-500 text-white p-2 rounded"
      >
        Delete
      </button>
    </div>
  </div>
);

const ManageContents = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const {user} = useContext(AuthContext)

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem("courses"))
    if(user.role === "instructor"){
      const instructorCourses = c.filter(item => item.created_by_details.id === user?.instructor.id)
      setCourses(instructorCourses)
    } else setCourses(c)
  }, []);

  useEffect(() => {
    const selectedCourse = courses.find(course => course.id == selectedCourseId);
    setContents(selectedCourse?.contents || []);
  }, [selectedCourseId, courses]); // slight fix: also depend on `courses`

  const handleCourseChange = (e) => setSelectedCourseId(e.target.value);

  const handleContentChange = (index, e) => {
    const { name, value } = e.target;
    setContents(prev => 
      prev.map((content, i) => (i === index ? { ...content, [name]: value } : content))
    );
  };

  const handleUpdateContents = async (e) => {
    e.preventDefault();
    setLoading(true)
    try {
      await Promise.all(
        contents.map(content => 
          updateContentById(content.id, {
            title: content.title,
            content_type: content.content_type,
            order: content.order,
            url: content.url,
            text_content: content.text_content,
          })
        )
      );
      toast.success("All contents updated successfully!");
    } catch (error) {
      console.error("Error updating contents:", error);
      toast.error("Failed to update contents. Please try again.");
    } finally{
      setLoading(false)
    }
  };

  const handleDeleteContent = async (contentId) => {
    try {
      const result = await ShowConfirmation();
      if (result.isConfirmed) {
        await deleteContentById(contentId);
        setContents(prev => prev.filter(content => content.id !== contentId));
        toast.success('Content deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content. Please try again.');
    }
  };

  return (
    <AdminLayout>
      <Helmet>
		    <title>Manage Contents | KUETx</title>
    	</Helmet>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Manage Contents</h1>

        <select 
          value={selectedCourseId}
          onChange={handleCourseChange}
          className="p-2 border rounded mb-6"
        >
          <option value="">Select a course</option>
          {
            loading ? <option>Loading...</option> : 
            courses.map(({ id, title }) => (
              <option key={id} value={id}>{title}</option>
            ))
          }
        </select>

        {selectedCourseId && (
          contents.length > 0 ? (
            <form onSubmit={handleUpdateContents}>
              {contents.map((content, index) => (
                <ContentFormFields
                  key={content.id}
                  content={content}
                  index={index}
                  handleChange={handleContentChange}
                  handleDelete={handleDeleteContent}
                />
              ))}
              <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded">
                {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                "Save Changes"
                )}
              </button>
            </form>
          ) : (
            <h2 className="text-center text-xl">No contents available. Add contents first.</h2>
          )
        )}
      </div>
    </AdminLayout>
  );
};

ContentFormFields.propTypes = {
  content: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    content_type: PropTypes.string,
    url: PropTypes.string,
    text_content: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
};

export default ManageContents;
