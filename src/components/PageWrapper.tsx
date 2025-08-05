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
        paddingBottom: "56px"
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