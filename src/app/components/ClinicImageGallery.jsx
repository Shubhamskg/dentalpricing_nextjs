import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './ClinicImageGallery.module.scss';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function ClinicImageGallery({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const imagesPerView = 5; // Change this to 4 if you want to show 4 images

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isHovered) {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [isHovered, images.length]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div 
      className={styles.scrollContainer}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button className={`${styles.scrollButton} ${styles.leftButton}`} onClick={handlePrev}>
        <FaChevronLeft />
      </button>
      <div className={styles.imageWrapper} style={{ transform: `translateX(-${currentIndex * (100 / imagesPerView)}%)` }}>
        {images.concat(images.slice(0, imagesPerView - 1)).map((image, index) => (
          <div key={index} className={styles.imageItem}>
            <Image
              src={image}
              alt={`Clinic image ${index % images.length + 1}`}
              width={200}
              height={150}
              style={{ objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>
      <button className={`${styles.scrollButton} ${styles.rightButton}`} onClick={handleNext}>
        <FaChevronRight />
      </button>
    </div>
  );
}