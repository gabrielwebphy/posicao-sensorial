import { useRef } from 'react';

function Box(props) {
  const mesh = useRef();
  return (
    <>
      <mesh {...props} ref={mesh}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#FFAE00" />
      </mesh>
      <mesh {...props} ref={mesh}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#000000" wireframe />
      </mesh>
    </>


  );
}

export default Box