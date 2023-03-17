import { useRef } from 'react';

function Box(props) {
  const mesh = useRef();
  // rotate the box

  // draw the box
  return (
    <>
      <mesh {...props} ref={mesh}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#FFAE00" />
      </mesh>
      <mesh {...props} ref={mesh}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#000000" wireframe />
      </mesh>
    </>


  );
}

export default Box