import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
const explodeSound = new Audio('backgrounds/explosion.mp3');


      let scene, camera, renderer;
      let stones = [];
      let wordInput;
      let fallingSpeed = 0.015;
      let gameOver = false;
      let score = 0;
      let lives = 5;
      let scoreElement, livesElement, restartButton;

      const categories = {
        fruits: ['APPLE', 'BANANA', 'ORANGE', 'MANGO', 'PEACH'],
        vegetables: ['CARROT', 'TOMATO', 'SPINACH', 'POTATO', 'ONION'],
        dishes: ['PIZZA', 'BURGER', 'PASTA', 'CURRY', 'SALAD']
      };

      let currentCategoryWords = [];

      function shuffleWord(word) {
        return word.split('').sort(() => Math.random() - 0.5).join('');
      }

      function init() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x17202a);
        // const loader = new THREE.TextureLoader();
        // loader.load('backgrounds/main.jpg', function (texture) {
        //   scene.background = texture;
        // });


        camera = new THREE.PerspectiveCamera(
          70,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        camera.position.z = 5;
        camera.position.y = 2;

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        const light = new THREE.DirectionalLight(0xffffff, 0.8);
        light.position.set(1, 2,5);
        scene.add(light);

        setupUI();
        showCategoryPopup();
      }

      function setupUI() {
        wordInput = document.createElement('input');
        wordInput.style.position = 'absolute';
        wordInput.style.bottom = '20px';
        wordInput.style.left = '50%';
        wordInput.style.transform = 'translateX(-50%)';
        wordInput.style.fontSize = '24px';
        document.body.appendChild(wordInput);

        scoreElement = document.createElement('div');
        scoreElement.style.position = 'absolute';
        scoreElement.style.top = '10px';
        scoreElement.style.left = '10px';
        scoreElement.style.fontSize = '24px';
        scoreElement.style.color = 'white';
        scoreElement.innerHTML = `Score: 0`;
        document.body.appendChild(scoreElement);

        livesElement = document.createElement('div');
        livesElement.style.position = 'absolute';
        livesElement.style.top = '10px';
        livesElement.style.right = '10px';
        livesElement.style.fontSize = '24px';
        livesElement.style.color = 'white';
        livesElement.innerHTML = `Lives: ${lives}`;
        document.body.appendChild(livesElement);

        restartButton = document.createElement('div');
        restartButton.innerText = 'Press any key to continue';
        restartButton.style.position = 'absolute';
        restartButton.style.top = '50%';
        restartButton.style.left = '50%';
        restartButton.style.transform = 'translate(-50%, -50%)';
        restartButton.style.padding = '10px 20px';
        restartButton.style.fontSize = '24px';
        restartButton.style.display = 'none';
        restartButton.style.color = 'white';
        restartButton.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        restartButton.style.borderRadius = '8px';
        document.body.appendChild(restartButton);
      }

      function showCategoryPopup() {
        const existing = document.getElementById('categoryPopup');
        if (existing) return;

        const categoryPopup = document.createElement('div');
        categoryPopup.id = 'categoryPopup';
        categoryPopup.style.position = 'absolute';
        categoryPopup.style.top = '50%';
        categoryPopup.style.left = '50%';
        categoryPopup.style.transform = 'translate(-50%, -50%)';
        categoryPopup.style.backgroundColor = 'rgba(255,255,255,0.95)';
        categoryPopup.style.padding = '20px';
        categoryPopup.style.borderRadius = '10px';
        categoryPopup.style.textAlign = 'center';
        categoryPopup.style.zIndex = '10';

        const title = document.createElement('h2');
        title.textContent = 'Choose a Category';
        categoryPopup.appendChild(title);

        ['fruits', 'vegetables', 'dishes'].forEach((cat) => {
          const button = document.createElement('button');
          button.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
          button.style.margin = '10px';
          button.style.padding = '10px 20px';
          button.style.fontSize = '18px';
          button.style.cursor = 'pointer';
          button.onclick = () => {
            currentCategoryWords = categories[cat];
            document.body.removeChild(categoryPopup);
            wordInput.focus();
            animate();
          };
          categoryPopup.appendChild(button);
        });

        document.body.appendChild(categoryPopup);
      }

      function spawnStone() {
        if (stones.length >= 2 || !currentCategoryWords.length) return;
      
        const word =
          currentCategoryWords[
            Math.floor(Math.random() * currentCategoryWords.length)
          ];
        const jumbled = shuffleWord(word);
      
        // Estimate stone radius based on word length (adjust scaling factor as needed)
        const radius = 0.01 + jumbled.length * 0.07;
      
        const geometry = new THREE.SphereGeometry(radius, 64, 32);
        const material = new THREE.MeshStandardMaterial({ color: 'white' });
        const stone = new THREE.Mesh(geometry, material);
      
        stone.position.x = (Math.random() - 0.5) * 4;
        stone.position.y = 5;
      
        stone.userData = {
          word: word,
          jumbled: jumbled,
          xSpeed: (Math.random() - 0.5) * 0.015,
          radius: radius
        };
      
        scene.add(stone);
        stones.push(stone);
      
        // Create the label
        const label = document.createElement('div');
        label.textContent = jumbled;
        label.style.position = 'absolute';
        label.style.color = 'white';
        label.style.fontWeight = 'bold';
        label.style.pointerEvents = 'none';
        label.style.whiteSpace = 'nowrap';
        label.style.fontSize = `${Math.max(12, 24 - jumbled.length * 1.5)}px`; // Shrink font for longer words
        document.body.appendChild(label);
        stone.userData.label = label;
      }
      
      

      function animate() {
        if (gameOver) return;
      
        requestAnimationFrame(animate);
      
        stones.forEach((stone, index) => {
          // Move down
          stone.position.y -= fallingSpeed;
        
          // Drift horizontally
          stone.position.x += stone.userData.xSpeed;
        
          // Project stone's position to 2D
          const vector = stone.position.clone().project(camera);
          const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
          const y = (1 - (vector.y * 0.5 + 0.5)) * window.innerHeight;
        
          // Center the label horizontally
          const label = stone.userData.label;
          const labelWidth = label.offsetWidth;
          const labelHeight = label.offsetHeight;
        
          label.style.left = `${x - labelWidth / 2}px`;
          label.style.top = `${y - labelHeight / 2}px`;
        
          // Check for fall below
          if (stone.position.y <= -1) {
            loseLife(index);
          }
        });
      
        const enteredWord = wordInput.value.toUpperCase();
        stones.forEach((stone, index) => {
          if (enteredWord === stone.userData.word) {
            score += 10;
            updateUI();
            triggerExplosion(stone.position);  // Trigger explosion
            scene.remove(stone);
            document.body.removeChild(stone.userData.label);
            stones.splice(index, 1);
            wordInput.value = '';
            fallingSpeed += 0.001; 
          }
        });
      
        if (Math.random() < 0.01) {
          spawnStone();
        }
      
        renderer.render(scene, camera);
      }

      function triggerExplosion(position) {
        const particleCount = 50;
        const particleGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
          const particle = new THREE.Mesh(particleGeometry, particleMaterial);
          particle.position.set(position.x, position.y, position.z);
          
          // Apply a random velocity to each particle
          const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
          );
          
          particle.userData = { velocity: velocity, life: 100 };
          scene.add(particle);
      
          // Animate particles to fade out and disappear
          animateParticle(particle);
        }
      }
      
      function animateParticle(particle) {
        explodeSound.currentTime = 0;
        explodeSound.play();

        const particleLifetime = 100;
      
        function updateParticle() {
          particle.position.add(particle.userData.velocity);
          particle.userData.life--;
      
          // Fade out the particle
          const alpha = Math.max(0, particle.userData.life / particleLifetime);
          particle.material.opacity = alpha;
      
          if (particle.userData.life <= 0) {
            scene.remove(particle);
          } else {
            requestAnimationFrame(updateParticle);
          }
        }
      
        updateParticle();
      }
      
      

      function loseLife(index) {
        lives--;
        updateUI();
        if (stones[index]) {
          scene.remove(stones[index]);
          document.body.removeChild(stones[index].userData.label);
          stones.splice(index, 1);
        }

        if (lives <= 0) {
          endGame();
        }
      }

      function updateUI() {
        scoreElement.innerHTML = `Score: ${score}`;
        livesElement.innerHTML = `Lives: ${lives}`;
      }

      function endGame() {
        gameOver = true;
        wordInput.disabled = true;
        restartButton.style.display = 'block';
        window.addEventListener('keydown', handleRestartOnce);
      }

      function handleRestartOnce(event) {
        event.preventDefault();
        event.stopPropagation();
        window.removeEventListener('keydown', handleRestartOnce);

        gameOver = false;
        score = 0;
        lives = 5;
        fallingSpeed = 0.015;
        updateUI();
        wordInput.value = '';
        wordInput.disabled = false;
        restartButton.style.display = 'none';

        stones.forEach((stone) => {
          scene.remove(stone);
          document.body.removeChild(stone.userData.label);
        });
        stones = [];

        showCategoryPopup();
      }

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      if (screen.orientation && screen.orientation.lock) {
        screen.orientation
          .lock('portrait')
          .catch((err) => console.log('Cannot lock orientation:', err));
      }

      init();

      window.onload = () => {
        wordInput.focus();
      };