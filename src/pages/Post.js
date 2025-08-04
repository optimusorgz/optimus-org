import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import InfiniteTypingText from '../components/InfiniteTypingText';
import { PageWrapper } from '../components/common/PageWrapper';
import { pulseGradient } from '../styles/GlobalStyles'; // Import pulseGradient
import avtar from './../assets/avtar.jpeg';
import post1 from './../assets/post/post1.mp4';
import post2 from './../assets/post/post2.mp4';
import post3 from './../assets/post/post3.mp4';
import post4 from './../assets/post/post4.mp4';
import post5 from './../assets/post/post5.mp4';
import post6 from './../assets/post/post6.mp4';
import post7 from './../assets/post/post7.mp4';
import post8 from './../assets/post/post8.mp4';
import post9 from './../assets/post/post9.mp4';
import post10 from './../assets/post/post10.mp4';
import post11 from './../assets/post/post11.mp4';
import image1 from './../assets/6106991.jpg';
import image2 from './../assets/3334896.jpg';

const PostCardStyled = styled.div`
  background: ${props => props.theme.cardBackground};
  border: 1px solid ${props => props.theme.cardBorder};
  border-radius: 15px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.shadow};
  }
`;

const GradientBackground = styled.div`
  background: linear-gradient(180deg, rgba(24, 18, 38, 1) 0%, rgba(24, 18, 38, 0.8) 100%);
  min-height: 100vh;
  padding: 40px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  color: #e0e0ff;

  @media (max-width: 768px) {
    padding: 20px 10px;
  }
`;

// Mock Data for Posts Only
const mockPosts = [
  {
    id: 'p1',
    username: 'optimus.orgz',
    avatar: avtar,
    media: post1,
    type: 'video',
    caption: 'Our first successful project in the AI/ML domain! #AI #ML #Optimus',
    timestamp: '2 hours ago',
  },
  {
    id: 'p2',
    username: 'optimus.orgz',
    avatar: avtar,
    media: post2,
    type: 'video',
    caption: 'Exploring new horizons in cyber security. Stay tuned for more! #CyberSecurity #Innovation',
    timestamp: '5 hours ago',
  },
  {
    id: 'p3',
    username: 'optimus.orgz',
    avatar: avtar,
    media: post3,
    type: 'video',
    caption: 'Team brainstorming session - great ideas are brewing! #Teamwork #TechClub',
    timestamp: '1 day ago',
  },
  {
    id: 'p4',
    username: 'optimus.orgz',
    avatar: avtar,
    media: post4,
    type: 'video',
    caption: 'Showcasing our latest web development project. Clean code, sleek design! #WebDev #React',
    timestamp: '2 days ago',
  },
  {
    id: 'p5',
    username: 'optimus.orgz',
    avatar: avtar,
    media: post5,
    type: 'video',
    caption: 'Dive deep into data science with Optimus. Join us! #DataScience #BigData',
    timestamp: '3 days ago',
  },
  {
    id: 'p6',
    username: 'optimus.orgz',
    avatar: avtar,
    media: post6,
    type: 'video',
    caption: 'Our robotics division is making strides. The future is automated! #Robotics #Automation',
    timestamp: '4 days ago',
  },
  {
    id: 'p7',
    username: 'optimus.orgz',
    avatar: avtar,
    media: post7,
    type: 'video',
    caption: 'Learning session on ethical hacking. Knowledge is power! #EthicalHacking #InfoSec',
    timestamp: '5 days ago',
  },
  {
    id: 'p8',
    username: 'optimus.orgz',
    avatar: avtar,
    media: post8,
    type: 'video',
    caption: 'From concept to creation: our journey in software development. #SoftwareDev #Coding',
    timestamp: '6 days ago',
  },
  {
    id: 'p9',
    username: 'optimus.orgz',
    avatar: avtar,
    media: post9,
    type: 'video',
    caption: 'The art of game development with Optimus. Fun and challenging! #GameDev #Unity',
    timestamp: '1 week ago',
  },
  {
    id: 'p10',
    username: 'optimus.orgz',
    avatar: avtar,
    media: post10,
    type: 'video',
    caption: 'Cloud computing insights from our experts. Scale up your skills! #CloudComputing #AWS',
    timestamp: '1 week ago',
  },
  {
    id: 'p11',
    username: 'optimus.orgz',
    avatar: avtar,
    media: post11,
    type: 'video',
    caption: 'Our community growing stronger everyday. Join Optimus! #TechCommunity #OptimusFamily',
    timestamp: '1 week ago',
  },
  {
    id: 'p12',
    username: 'optimus.orgz',
    avatar: avtar,
    media: image1,
    type: 'image',
    caption: 'A glimpse into our recent workshop on AI ethics. Thought-provoking discussions! #AIethics #Workshop',
    timestamp: '2 weeks ago',
  },
  {
    id: 'p13',
    username: 'optimus.orgz',
    avatar: avtar,
    media: image2,
    type: 'image',
    caption: 'Celebrating milestones with the team! Onwards and upwards! #Milestone #Celebration',
    timestamp: '2 weeks ago',
  },
];

const PostCard = ({ post, onClick, isModalOpen }) => {
  const videoRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const observerRef = useRef(null);

  // Update isMobile on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Desktop: play/pause on hover, always muted
  const handleMouseEnter = () => {
    if (!isMobile && videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  };
  const handleMouseLeave = () => {
    if (!isMobile && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.muted = true;
    }
  };

  // Mobile: IntersectionObserver to autoplay with sound
  useEffect(() => {
    if (!isMobile || !videoRef.current) return;
    const video = videoRef.current;
    video.muted = false;
    observerRef.current = new window.IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            video.muted = false;
            video.play().catch(() => {});
          } else {
            video.pause();
            video.currentTime = 0;
          }
        });
      },
      { threshold: 0.5 }
    );
    observerRef.current.observe(video);
    return () => observerRef.current && observerRef.current.disconnect();
  }, [isMobile, post.media]);

  return (
    <PostCardStyled onClick={onClick}>
      <PostHeader>
        <PostAvatar src={post.avatar} alt={post.username} />
        <PostUsername>{post.username}</PostUsername>
        <ProfileButton
          href="https://www.instagram.com/optimus.orgz/"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Profile
        </ProfileButton>
      </PostHeader>
      <PostImage>
        <video
          ref={videoRef}
          src={post.media}
          playsInline
          controls={false}
          muted={!isMobile}
          style={{ pointerEvents: 'auto', width: '100%', height: '100%', objectFit: 'cover', background: '#eee', display: 'block', position: 'static' }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      </PostImage>
      <PostCaption>{post.caption}</PostCaption>
    </PostCardStyled>
  );
};




const ContentContainer = styled.div`
width: 100%;
  max-width: 900px;
/* Re-added background color */
  border-radius: 15px;

@media(max-width: 900px) {
  max-width: 100%;
}

`;



const PostHeader = styled.div`
padding: 12px 16px;
  border-bottom: 1px solid rgba(40, 20, 60, 0.25);
display: flex;
  align-items: center;
background: rgba(24, 18, 38, 0.85);
`;

const ProfileButton = styled.a`
  margin-left: auto;
  background: linear-gradient(90deg, #6a5acd 60%, #483d8b 100%);
color: #fff;
border: none;
  border-radius: 20px;
padding: 6px 16px;
  font-weight: bold;
  text-decoration: none;
display: flex;
  align-items: center;
gap: 8px;
cursor: pointer;
  box-shadow: 0 2px 8px rgba(40, 20, 60, 0.18);
transition: background 0.2s;

  &:hover {
    background: linear-gradient(90deg, #483d8b 60%, #6a5acd 100%);
  color: #ffd700;
}
`;

const PostAvatar = styled.img`
  border-radius: 50%;
  object-fit: cover;
width: 40px;
height: 40px;
  margin-right: 12px;
border: 2px solid rgba(80, 60, 120, 0.5);
`;

const PostUsername = styled.span`
color: #e0e0ff;
font-weight: bold;
  font-size: 1.1em;
`;

const PostTimestamp = styled.span`
color: #b0a8d8;
font-size: 0.85em;
margin-left: auto;
`;

const PostImage = styled.div`
  width: 100%;
  aspect-ratio: 9/16;
position: relative;
  background: linear-gradient(120deg, rgba(40, 20, 60, 0.7) 60%, rgba(24, 18, 38, 0.9) 100%);
overflow: hidden;
display: flex;
  justify-content: center;
  align-items: center;

img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover; /* Changed to 'cover' to fill the container */
  background: #eee;
  display: block;
  position: static;
}
`;

const PostCaption = styled.div`
padding: 12px 16px;
color: #e0e0ff;
background: rgba(24, 18, 38, 0.85);
font-size: 1em;
border-top: 1px solid rgba(40, 20, 60, 0.25);
`;

const PostsGrid = styled.div`
display: grid;
  grid-template-columns: repeat(2, 1fr);
gap: 20px;
  justify-content: center;
  align-items: start;
margin: 0 auto;
padding: 20px;
  width: 100%;
  max-width: 800px;
  box-sizing: border-box;

@media(max-width: 900px) {
  grid-template-columns: 1fr;
  max-width: 100%;
}
`;

const PostModalOverlay = styled.div`
position: fixed;
top: 0;
left: 0;
width: 100vw;
height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
padding: 40px 20px;

@media(max-width: 768px) {
  padding: 10px;
  align-items: center;
  height: 100vh;
}
`;

const PostModalContent = styled.div`
background-color: #fff;
color: #222;
border-radius: 8px;
display: flex;
width: 100%;
max-width: 900px;
max-height: 90vh;
overflow: hidden;
position: relative;

@media(max-width: 1024px) {
  max-width: 95vw;
  max-height: 95vh;
}
@media(max-width: 768px) {
  flex-direction: column;
  max-width: 100vw;
  max-height: 100vh;
  border-radius: 0;
  background: #fff;
  color: #222;
}
`;

const ModalImageContainer = styled.div`
display: flex;
justify-content: center;
align-items: center;
background-color: black;
  background-color: black;
position: relative;
  width: 100%;
flex: 1; /* Changed to flex: 1 for 50/50 split */

video, img {
    width: 100%;
    height: 100%;
    object-fit: contain; /* Changed back to contain for modal as per Instagram */
  background: black;
  display: block;
}
`;

const ModalImage = styled.img`
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
object-fit: contain; /* Changed back to contain for modal as per Instagram */

  &.modal-video, &.modal-image {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Changed back to contain */
  border-radius: 0;
}
`;

const ModalDetailsContainer = styled.div`
display: flex;
  flex-direction: column;
padding: 20px;
  border-left: 1px solid #eee;
flex: 1; /* Changed to flex: 1 for 50/50 split */
  background-color: #fff; /* Changed to white background */
color: #222; /* Changed to black text */

@media(max-width: 768px) {
  border-left: none;
  border-top: 1px solid #eee;
  background: transparent; /* Changed to transparent background */
}
`;

const FollowButton = styled.a`
background: #0095f6;
color: #fff;
border: none;
  border-radius: 4px;
padding: 8px 12px;
  font-weight: bold;
cursor: pointer;
  margin-left: auto;
text-decoration: none;
display: inline-block;

  &:hover {
  background: #007bb5;
  color: #fff;
}
`;

const ModalPostHeader = styled(PostHeader)`

background: #696683ff; /* Changed to white background */
color: #222;
`;

const ModalPostCaption = styled(PostCaption)`

color: #222; /* Changed to black text */
background: #fff;
`;

const CloseButton = styled.button`
position: absolute;
top: 10px;
right: 10px;
background: #fff;
border: none;
  border-radius: 50%;
width: 36px;
height: 36px;
  font-size: 2em;
color: #222;
cursor: pointer;
  z-index: 1001;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
display: flex;
align-items: center;
justify-content: center;
transition: background 0.2s, color 0.2s;

  &:hover {
  background: #eee;
  color: #000;
}

@media(max-width: 768px) {
  top: 10px;
  right: 10px;
  background: #fff; /* Changed to white background */
  color: #222; /* Changed to black text */
}
`;

const NavButton = styled.button`
top: 50%;
  transform: translateY(-50%);
background: rgba(0, 0, 0, 0.5);
color: #fff;
border: none;
padding: 10px;
cursor: pointer;
  font-size: 1.5em;
  z-index: 1001;
position: absolute;

  &:hover {
  background: rgba(0, 0, 0, 0.7);
}
`;

const PrevButton = styled(NavButton)`
left: 10px;
`;

const NextButton = styled(NavButton)`
right: 10px;
`;

const Post = () => {
  const [selectedPostIndex, setSelectedPostIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('posts');
  const touchStartY = useRef(0);

  const openModal = (index) => {
    // Pause all background videos when opening modal (especially for mobile)
    const videos = document.querySelectorAll('video');
    videos.forEach((vid) => {
      vid.pause();
      vid.currentTime = 0;
    });
    setSelectedPostIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    const videoElement = document.querySelector('#postModalVideo');
    if (videoElement) {
      videoElement.pause();
    }
    setIsModalOpen(false);
  };

  const navigatePosts = (direction) => {
    setSelectedPostIndex(prevIndex => {
      const newIndex = prevIndex + direction;
      if (newIndex < 0) return mockPosts.length - 1;
      if (newIndex >= mockPosts.length) return 0;
      return newIndex;
    });
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    // Prevent default scroll behavior if swiping vertically within the modal
    const currentTouchY = e.touches[0].clientY;
    const diffY = currentTouchY - touchStartY.current;
    // Only prevent default if it's a significant vertical swipe
    if (Math.abs(diffY) > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchEndY - touchStartY.current;

    if (diffY > 50) { // Swiped down
      navigatePosts(-1);
    } else if (diffY < -50) { // Swiped up
      navigatePosts(1);
    }
  };

  const currentPost = mockPosts[selectedPostIndex];

  return (
    <GradientBackground>
      <InfiniteTypingText text="Our Posts" />


      <ContentContainer>
        {activeSection === 'posts' && (
          <PostsGrid>
            {mockPosts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => openModal(index)}
                isModalOpen={isModalOpen}
              />
            ))}
          </PostsGrid>
        )}
        {activeSection === 'reels' && (
          <div>
            <h2>Reels Section (Placeholder)</h2>
            <p>Video reels will be displayed here.</p>
          </div>
        )}
        {activeSection === 'profile' && (
          <div>
            <h2>Profile Section (Placeholder)</h2>
            <p>User profile information will be displayed here.</p>
          </div>
        )}
      </ContentContainer>

      {isModalOpen && currentPost && (
        <PostModalOverlay onClick={e => {
          if (e.target === e.currentTarget) closeModal();
        }}>
          <CloseButton onClick={closeModal}>&times;</CloseButton>
          <PostModalContent
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <PrevButton onClick={() => navigatePosts(-1)} style={{ left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 1002 }}>&#8592;</PrevButton>
            <ModalImageContainer>
              {currentPost.type === 'image' && (
                <ModalImage src={currentPost.media} alt="Post" className="modal-image" />
              )}
              {currentPost.type === 'video' && (
                <video
                  src={currentPost.media}
                  autoPlay
                  controls
                  muted={false}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'black', display: 'block' }}
                />
              )}
            </ModalImageContainer>
            <NextButton onClick={() => navigatePosts(1)} style={{ right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 1002 }}>&#8594;</NextButton>
            <ModalDetailsContainer>
              <ModalPostHeader>
                <PostAvatar src={currentPost.avatar} alt={currentPost.username} />
                <PostUsername>{currentPost.username}</PostUsername>
                <FollowButton
                  href="https://www.instagram.com/optimus.orgz/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Follow
                </FollowButton>
              </ModalPostHeader>
              <ModalPostCaption>{currentPost.caption}</ModalPostCaption>
              {/* Comments section can go here */}
            </ModalDetailsContainer>
          </PostModalContent>
        </PostModalOverlay>
      )}
    </GradientBackground>
  );
};

export default Post;
