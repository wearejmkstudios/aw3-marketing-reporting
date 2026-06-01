export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/report/index.html",
      permanent: false
    }
  };
}

export default function Home() {
  return null;
}
