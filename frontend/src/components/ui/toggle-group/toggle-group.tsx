import React from 'react';

export const ToggleGroup = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
  (props, ref) => {
    return (
      <div ref={ref} {...props}>
        {props.children}
      </div>
    );
  }
);

ToggleGroup.displayName = "ToggleGroup";

export default ToggleGroup;

// ... other code or exports if necessary ...
