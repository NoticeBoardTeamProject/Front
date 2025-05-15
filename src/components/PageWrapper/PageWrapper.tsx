interface PageWrapperProps {
    children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({
    children,
}) => {

   return (
      <div style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "rgb(23, 25, 27)"
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