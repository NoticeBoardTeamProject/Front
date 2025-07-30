interface PageWrapperProps {
    children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({
    children,
}) => {

   return (
      <div style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#0D0D0D"
      }}>
        <div style={{
            width: "1120px",
            marginTop: "24px",
            height: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        }}>
            {children}
        </div>
      </div>
   );
};

export default PageWrapper;