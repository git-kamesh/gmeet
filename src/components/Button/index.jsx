import React from 'react';

import './style.css';

const type_map = {
    primary: "primary",
    secondary: "secondary",
    danger: "danger"
};

export default function Button({ children, type = "primary", className = "", ...props }) {

    return (
        <button
            className={`ext-btn ${type_map[type]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}