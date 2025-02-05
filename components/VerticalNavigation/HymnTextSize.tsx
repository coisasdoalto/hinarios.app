import {
    MantineSize,
    SegmentedControl, Box} from '@mantine/core';
    import { useFontSizeStore } from '../Store/useFontSizeStore';
    import {ReactNode} from "react";


    interface HymnTextSizeProps {
      children?: ReactNode;
    }

    const HymnTextSize = ({ children }: HymnTextSizeProps) => {
      const { fontSize, setFontSize } = useFontSizeStore();
      const fontSizeMapping: Record<"md" | "lg" | "xl" | "xxl", string> = {
        md: "16px", 
        lg: "20px", 
        xl: "24px", 
        xxl: "40px", 
      };
    
      return (
        <>
        
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <SegmentedControl
              value={fontSize}
              onChange={(value: MantineSize) => setFontSize(value)}
              data={[
                { label: "P", value: "md" },
                { label: "M", value: "lg" },
                { label: "G", value: "xl" },
                { label: "GG", value: "xxl" }, 
              ]}
            />
          </Box>
    
          
          <div
            style={{
              fontSize: fontSizeMapping[fontSize as "md" | "lg" | "xl" | "xxl"],
            }}
          >
            {children}
          </div>
        </>
      );
    };

export default HymnTextSize;