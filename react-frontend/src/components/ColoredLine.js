import React from 'react';
export const ColoredLine = ({ color }) => (
    <hr
        style={{
            color,
            backgroundColor: color,
            height: 5
        }}
    />
);