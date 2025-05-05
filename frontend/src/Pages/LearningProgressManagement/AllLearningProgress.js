import React, { useEffect, useState } from 'react'; // Import React hooks  
import { FaEdit } from "react-icons/fa"; // Edit icon component  
import { RiDeleteBin6Fill } from "react-icons/ri"; // Delete icon component  
import NavBar from '../../Components/NavBar/NavBar'; // Navigation bar component  
import { IoIosCreate } from "react-icons/io"; // Create icon component  
import './AllLearningProgress.css'; // CSS styles for this component  

function AllLearningProgress() {  
  const [progressData, setProgressData] = useState([]); // State to store all learning progress data  
  const [filteredData, setFilteredData] = useState([]); // State to store filtered learning progress data  
  const [searchQuery, setSearchQuery] = useState(''); // State to store search query input  
  const userId = localStorage.getItem('userID'); // Get user ID from localStorage  

  useEffect(() => {  
    // Fetch learning progress data from the server  
    fetch('http://localhost:8080/learningProgress')  
      .then((response) => response.json()) // Parse response as JSON  
      .then((data) => {  
        setProgressData(data); // Store fetched data in state  
        setFilteredData(data); // Initialize filtered data with all data  
      })  
      .catch((error) => console.error('Error fetching Learning Progress data:', error)); // Log errors  
  }, []); // Empty dependency array ensures this runs only once on mount  

  const handleSearch = (e) => {  
    const query = e.target.value.toLowerCase(); // Get search query and convert to lowercase  
    setSearchQuery(query); // Update search query state  

    // Filter progressData based on title or description matching the query  
    const filtered = progressData.filter(  
      (progress) =>  
        progress.title.toLowerCase().includes(query) ||  
        progress.description.toLowerCase().includes(query)  
    );  
    setFilteredData(filtered); // Update filtered data state  
  };  

  const handleDelete = async (id) => {  
    // Confirm deletion with the user  
    if (window.confirm('Are you sure you want to delete this Learning Progress?')) {  
      try {  
        // Send DELETE request to the server  
        const response = await fetch(`http://localhost:8080/learningProgress/${id}`, {  
          method: 'DELETE',  
        });  
        if (response.ok) {  
          alert('Learning Progress deleted successfully!'); // Show success message  
          setFilteredData(filteredData.filter((progress) => progress.id !== id)); // Remove deleted item from state  
        } else {  
          alert('Failed to delete Learning Progress.'); // Show error message  
        }  
      } catch (error) {  
        console.error('Error deleting Learning Progress:', error); // Log errors  
      }  
    }  
  };  

  return (
    <div>
      <div className='continer'>
        <NavBar />
        <div className='continSection'>
          {/* Sidebar Search Section */}
          <aside className='searchinput'>
            <input
              type="text"
              className="Auth_input"
              placeholder="Search learning progress..."
              value={searchQuery}
              onChange={handleSearch}
            />
            <div className='add_new_btn' onClick={() => (window.location.href = '/addLearningProgress')}>
              <IoIosCreate size={20} /> Create New Learning Progress
            </div>
          </aside>

          {/* Main Content Section */}
          <div className='post_card_continer'>
            {filteredData.length === 0 ? (
              <div className='not_found_box'>
                <div className='not_found_img'></div>
                <p className='not_found_msg'>No learning progress found.</p>
                <button className='not_found_btn' onClick={() => (window.location.href = '/addLearningProgress')}>
                  <IoIosCreate size={20} /> Create New Learning Progress
                </button>
              </div>
            ) : (
              filteredData.map((progress) => (
                <div key={progress.id} className='post_card_new'>
                  <div className='user_details_card'>
                    <div className='user_details_card_di'>
                      <p className='name_section_post_owner_name'>{progress.postOwnerName}</p>
                      <p className='date_card_dte'>{progress.date}</p>
                    </div>
                    {progress.postOwnerID === userId && (
                      <div className='action_btn_icon_post'>
                        <FaEdit
                          onClick={() => (window.location.href = `/updateLearningProgress/${progress.id}`)}
                          className='action_btn_icon'
                        />
                        <RiDeleteBin6Fill
                          onClick={() => handleDelete(progress.id)}
                          className='action_btn_icon'
                        />
                      </div>
                    )}
                  </div>
                  <div className='dis_con'>
                    <h3 className='topic_cont'>{progress.title}</h3>
                    <p className='dis_con_pera' style={{ whiteSpace: "pre-line" }}>{progress.description}</p>
                    {progress.imageUrl && (
                      <img
                        src={`http://localhost:8080/learningProgress/images/${progress.imageUrl}`}
                        alt="Learning Progress"
                        className='achievement_image'
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllLearningProgress;
