import React from 'react' 
import { Navbar } from './Navbar';
import { Wrapper, wrapperVariant } from './Wrapper';

interface LayoutProps {
    variant? : wrapperVariant;
}

export const Layout: React.FC<LayoutProps> = ({
 variant,
 children
}) =>{
        return (
        <>
        <Navbar />
            <Wrapper variant={variant}>     
                {children}
            </Wrapper>
            </>
        );
}