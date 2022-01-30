import React from 'react';
import './style.css';

export default function ({ className = "", title, selected, options, onChange, ...props }) {
    return (
        <React.Fragment>
            <div className={`ext-drpdwn-title ${className}`}>{title}</div>
            <select className="ext-drpdwn" {...props} onChange={(e) => onChange(e.target.value)} defaultValue={'DEFAULT'}>
                {selected ? '' : <option value="DEFAULT" disabled>Choose here</option>}
                {options.map(item => <option key={item.value} value={item.value} selected={selected == item.value}>{item.label}</option>)}
            </select>
        </React.Fragment>
    );
}