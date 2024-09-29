import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './ClinicDescription.module.scss';

const ClinicDescription = ({ website }) => {
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDescription = async () => {
            try {
                const cachedData = sessionStorage.getItem(`clinic-description-${website}`);
                if (cachedData) {
                    setDescription(JSON.parse(cachedData).description);
                    setLoading(false);
                    return;
                }

                const response = await fetch(`/api/clinicDescriptions?website=${encodeURIComponent(website)}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch clinic description');
                }
                const data = await response.json();
                setDescription(data.description);
                sessionStorage.setItem(`clinic-description-${website}`, JSON.stringify(data));
            } catch (error) {
                console.error('Error fetching clinic description:', error);
                setError('Failed to load clinic description.');
            } finally {
                setLoading(false);
            }
        };

        fetchDescription();
    }, [website]);

    const truncatedDescription = useMemo(() => {
        return description.split(' ').slice(0, 50).join(' ');
    }, [description]);

    if (loading) {
        return null;
    }

    if (error || !description) {
        return null;
    }

    const markdownComponents = {
        h1: ({node, ...props}) => <h1 className={styles.heading1} {...props} />,
        h2: ({node, ...props}) => <h2 className={styles.heading2} {...props} />,
        h3: ({node, ...props}) => <h3 className={styles.heading3} {...props} />,
        p: ({node, ...props}) => <p className={styles.paragraph} {...props} />,
        ul: ({node, ...props}) => <ul className={styles.unorderedList} {...props} />,
        ol: ({node, ...props}) => <ol className={styles.orderedList} {...props} />,
        li: ({node, ...props}) => <li className={styles.listItem} {...props} />,
        a: ({node, ...props}) => <a className={styles.link} {...props} />,
    };

    return (
        <div className={styles.card}>
            <h2 className={styles.title}>Clinic Description</h2>
            <div className={styles.content}>
                <ReactMarkdown components={markdownComponents}>
                    {isExpanded ? description : `${truncatedDescription}...`}
                </ReactMarkdown>
                <button
                    className={styles.readMoreButton}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? 'Read Less' : 'Read More'}
                </button>
            </div>
        </div>
    );
};

export default React.memo(ClinicDescription);