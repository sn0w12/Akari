import Spinner from "./spinner";

const CenteredSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-40">
      <Spinner />
    </div>
  );
};

export default CenteredSpinner;
