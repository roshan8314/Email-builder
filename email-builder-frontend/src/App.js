import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

function App() {
    const [layout, setLayout] = useState("");
    const [sections, setSections] = useState([
        { id: 1, type: "title", content: "", style: {} },
        { id: 2, type: "content", content: "", style: {} },
        { id: 3, type: "footer", content: "", style: {} },
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

    // Fetch base layout from backend
    useEffect(() => {
        axios
            .get(`${API_URL}/getEmailLayout`)
            .then((response) => setLayout(response.data))
            .catch((error) => console.error("Error fetching layout:", error));
    }, [API_URL]);

    // Handle input changes for sections
    const handleInputChange = (id, field, value) => {
        setSections((prev) =>
            prev.map((section) =>
                section.id === id ? { ...section, [field]: value } : section
            )
        );
    };

    // Move sections up and down
    const moveSection = (index, direction) => {
        if (
            (index === 0 && direction === -1) ||
            (index === sections.length - 1 && direction === 1)
        ) {
            return; // Do nothing if out of bounds
        }
        const newSections = [...sections];
        const temp = newSections[index];
        newSections[index] = newSections[index + direction];
        newSections[index + direction] = temp;
        setSections(newSections);
    };

    // Handle save to backend
    const handleSave = async () => {
        setIsLoading(true);
        try {
            const emailConfig = { sections };
            await axios.post(`${API_URL}/uploadEmailConfig`, emailConfig);
            alert("Configuration saved successfully!");
        } catch (error) {
            alert("Failed to save configuration.");
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Render and download the email template
    const handleRender = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/renderAndDownloadTemplate`, {
                layout,
                config: sections,
            });
            const renderedHTML = response.data.renderedHTML;
            const blob = new Blob([renderedHTML], { type: "text/html" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "email-template.html";
            a.click();
        } catch (error) {
            alert("Failed to render template.");
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="App">
            <h1>Email Builder</h1>
            <div className="editor">
                {sections.map((section, index) => (
                    <div key={section.id} className="section">
                        <input
                            type="text"
                            value={section.content}
                            placeholder={`Edit ${section.type}`}
                            onChange={(e) =>
                                handleInputChange(section.id, "content", e.target.value)
                            }
                        />
                        <div className="style-controls">
                            <input
                                type="color"
                                onChange={(e) =>
                                    handleInputChange(section.id, "style", {
                                        ...section.style,
                                        color: e.target.value,
                                    })
                                }
                            />
                            <select
                                onChange={(e) =>
                                    handleInputChange(section.id, "style", {
                                        ...section.style,
                                        textAlign: e.target.value,
                                    })
                                }
                            >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                        <button onClick={() => moveSection(index, -1)}>Move Up</button>
                        <button onClick={() => moveSection(index, 1)}>Move Down</button>
                    </div>
                ))}
            </div>
            <button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
            </button>
            <button onClick={handleRender} disabled={isLoading}>
                {isLoading ? "Rendering..." : "Render & Download"}
            </button>
        </div>
    );
}

export default App;
