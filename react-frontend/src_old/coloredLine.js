export const ColoredLine = ({color}) => (
    <hr
        style={{
            color,
            backgroundColor: color,
            height: 5
        }}
    />
);