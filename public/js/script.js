import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

///////////////////////////////////////////////////////////////////////////////
//**********************************Viewer Class************************//                          
//////////////////////////////////////////////////////////////////////////////
/**
 * class Viewer to display 2D, 3D
 * @class Viewer
 * @return viewer 
 * @example new Viewer()
*/
class Viewer {
    constructor() {
        this._2DContainer = document.getElementById('twoDContainer');
        this._3DContainer = document.getElementById('threeDContainer');
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setClearColor(0x000000);
        this.renderer.setClearAlpha(0);
        this.renderer.setSize(this._3DContainer.clientWidth, this._3DContainer.clientHeight);
        this._3DContainer.appendChild(this.renderer.domElement);
        this.camera = new THREE.PerspectiveCamera(75, this._3DContainer.clientWidth / this._3DContainer.clientHeight, 0.1, 10000);
        this.camera.position.set(0, 0, 10); 
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.scene = new THREE.Scene();
        this.scale = 0.001;
        this.data = null;
        this.selectedPolygon = null;
        this.sectionColors = {}; 
        this.bindEvents();
        this.init();
    }

    async init() {
        await this.fetchData();
        this.setup2DViewer();
        this.setup3DViewer();
    }

    async fetchData() {
        const response = await fetch('/data');
        this.data = await response.json();
    }

    setup2DViewer() {
        const sectionDropdown = document.getElementById('sectionDropdown');
        const sections = this.data.polygonsBySection;
        sections.forEach((section, index) => {
            this.sectionColors[section.sectionId] = d3.schemeCategory10[index % 10];
        });
        sections.forEach(section => {
            const option = document.createElement('option');
            option.value = section.sectionId;
            option.textContent = section.sectionName;
            sectionDropdown.appendChild(option);
        });

        sectionDropdown.addEventListener('change', (event) => {
            const selectedSection = sections.find(section => section.sectionId === event.target.value);
            this.drawPolygons(selectedSection.polygons, selectedSection.sectionId);
            sectionDropdown.style.backgroundColor = this.sectionColors[selectedSection.sectionId];
        });
        if (sections.length > 0) {
            this.drawPolygons(sections[0].polygons, sections[0].sectionId);
            sectionDropdown.style.backgroundColor = this.sectionColors[sections[0].sectionId];
        }
    }

    drawPolygons(polygons, sectionId) {
        this._2DContainer.innerHTML = '';
        const svg = d3.select(this._2DContainer)
            .append('svg')
            .attr('width', this._2DContainer.clientWidth)
            .attr('height', this._2DContainer.clientHeight);
        const g = svg.append('g');
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        polygons.forEach(polygon => {
            if (polygon.points2D) {
                polygon.points2D.forEach(point => {
                    minX = Math.min(minX, point.vertex[0]);
                    minY = Math.min(minY, point.vertex[1]);
                    maxX = Math.max(maxX, point.vertex[0]);
                    maxY = Math.max(maxY, point.vertex[1]);
                });
            }
        });
        const margin = 40;
        const xScale = d3.scaleLinear()
            .domain([minX, maxX])
            .range([margin, this._2DContainer.clientWidth - margin]);
        
        const yScale = d3.scaleLinear()
            .domain([minY, maxY])
            .range([this._2DContainer.clientHeight - margin, margin]);

        polygons.forEach(polygon => {
            if (polygon.points2D) {
                const points = polygon.points2D.map(d => [xScale(d.vertex[0]), yScale(d.vertex[1])]);
                g.append('polygon')
                    .attr('points', points.map(d => d.join(',')).join(' '))
                    .attr('fill', `#${polygon.color}`) 
                    .attr('stroke', 'black')
                    .attr('stroke-width', 1)
                    .datum(polygon)
                    .on('click', (event, d) => this.selectPolygon(d))
                    .on('mouseover', function() { d3.select(this).attr('opacity', 0.7); })
                    .on('mouseout', function() { d3.select(this).attr('opacity', 1); });

            }
        });

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);
        const xAxisG = g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${this._2DContainer.clientHeight - margin})`)
            .call(xAxis);
        const yAxisG = g.append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${margin},0)`)
            .call(yAxis);
        const zoom = d3.zoom()
            .scaleExtent([0.5, 10])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
                xAxisG.call(xAxis.scale(event.transform.rescaleX(xScale)));
                yAxisG.call(yAxis.scale(event.transform.rescaleY(yScale)));
            });

        svg.call(zoom);
    }

   selectPolygon(polygon) {
        if (this.selectedPolygon) {
            d3.select(this._2DContainer)
              .selectAll('polygon')
              .filter(d => d === this.selectedPolygon)
              .attr('stroke-width', 1);
        }
        this.selectedPolygon = polygon;
        d3.select(this._2DContainer)
          .selectAll('polygon')
          .filter(d => d === polygon)
          .attr('stroke-width', 3);
        this.updatePolygonData(polygon);
    }

    updatePolygonData(polygon) {
        const polygonDataContent = document.getElementById('polygonDataContent');
        polygonDataContent.textContent = JSON.stringify(polygon, null, 2); 
    }

    setup3DViewer() {
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        this.data.polygonsBySection.forEach(section => {
            section.polygons.forEach(polygon => {
                polygon.points3D.forEach(point => {
                    const [x, y, z] = point.vertex;
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    minZ = Math.min(minZ, z);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                    maxZ = Math.max(maxZ, z);
                });
            });
        });

        const center = new THREE.Vector3(
            (minX + maxX) / 2,
            (minY + maxY) / 2,
            (minZ + maxZ) / 2
        );
        const size = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
        this.camera.position.copy(center);
        this.camera.position.z += size * 1.5;
        this.camera.lookAt(center);
        this.controls.target.copy(center);
        const gridHelper = new THREE.GridHelper(size, 10);
        gridHelper.position.set(center.x, minY, center.z);
        this.scene.add(gridHelper);
        this.addGridLabels(minX, maxX, minY, maxY, minZ, center, size);
        const axesHelper = new THREE.AxesHelper(size / 2);
        axesHelper.position.copy(center);
        //this.scene.add(axesHelper);
        this.addAxisLabel('X', new THREE.Vector3(center.x + size / 2, minY, center.z), 'red');
        this.addAxisLabel('Y', new THREE.Vector3(center.x, minY + size / 2, center.z), 'green');
        this.addAxisLabel('Z', new THREE.Vector3(center.x, minY, center.z + size / 2), 'blue');
        this.data.polygonsBySection.forEach(section => {
            section.polygons.forEach(polygon => {
                const geometry = new THREE.BufferGeometry();
                const vertices = [];
                const indices = [];
                polygon.points3D.forEach(point => {
                    vertices.push(point.vertex[0], point.vertex[1], point.vertex[2]);
                });
                for (let i = 1; i < polygon.points3D.length - 1; i++) {
                    indices.push(0, i, i + 1);
                }
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
                geometry.setIndex(indices);
                geometry.computeVertexNormals();
                const material = new THREE.MeshPhongMaterial({
                    color: `#${polygon.color}`,
                    side: THREE.DoubleSide,
                    flatShading: true
                });
                const mesh = new THREE.Mesh(geometry, material);
                this.scene.add(mesh);
            });
        });
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = size / 10;
        this.controls.maxDistance = size * 3;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.animate();
    }

    addAxisLabel(text, position, color) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = 'Bold 200px Arial';
        context.fillStyle = color;
        context.fillText(text, 0, 60);
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.copy(position);
        sprite.scale.set(100, 100, 1);
        this.scene.add(sprite);
    }

    addGridLabels(minX, maxX, minY, maxY, minZ, center, size) {
        const stepX = size / 10;
        const stepZ = size / 10;
        for (let i = 0; i <= 10; i++) {
            const x = minX + i * stepX;
            const z = minZ + i * stepZ;
            this.addLabel(x.toFixed(3), new THREE.Vector3(x, minY, minZ), 'blue', 120);
            this.addLabel(z.toFixed(3), new THREE.Vector3(minX, minY, z), 'blue', 120);
        }
    }

    addLabel(text, position, color, size = 60) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = `Bold ${size}px Arial`;
        context.fillStyle = color;
        context.fillText(text, 0, size);
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.copy(position);
        sprite.translateY(300);
        sprite.translateZ(-2500);
        sprite.scale.set(size, size, 1);
        this.scene.add(sprite);
    }

    onWindowResize() {
        this.camera.aspect = this._3DContainer.clientWidth / this._3DContainer.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this._3DContainer.clientWidth, this._3DContainer.clientHeight);
    }

    bindEvents() {
        window.addEventListener('resize', () => this.onWindowResize());
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the Viewer class
const viewer = new Viewer();
