import React from "react";

export const Card = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`card ${className}`} {...props}>{children}</div>
);

export const CardContent = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`card-content ${className}`} {...props}>{children}</div>
); 