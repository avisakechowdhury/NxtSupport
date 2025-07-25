import React from "react";

export const Badge = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={`badge ${className}`} {...props}>{children}</span>
); 