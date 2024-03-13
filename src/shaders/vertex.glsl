
            uniform float time;
            attribute vec3 offsetPosition;
            varying vec3 vColor;
            void main() {
                vec3 newPosition = position + offsetPosition * sin(time * 5.0); // Displace particles based on time
                vColor = vec3(0.5 + offsetPosition.x / 2.0, 0.5 + offsetPosition.y / 2.0, 0.5 + offsetPosition.z / 2.0); // Color based on position
                gl_PointSize = 5.0;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }