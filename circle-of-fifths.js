// 高级五度圈 - 按照参考图精确实现
class CircleOfFifths {
    constructor() {
        this.canvas = document.getElementById('circle-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.centerX = 0;
        this.centerY = 0;
        this.radius = 0;
        this.nodes = [];
        this.connections = [];
        this.hoveredNode = null;
        
        // 颜色定义（按照参考图）
        this.colors = {
            major: '#00ff00',         // 大调 - 绿色
            minor: '#4444ff',         // 小调 - 蓝色
            dom7_1: '#ff0000',        // 属七1 - 红色
            dom7_2: '#ff8800',        // 属七2/副属 - 橙色
            halfDim: '#ff88ff'        // 半减七 - 粉色
        };
        
        this.init();
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.createNodes();
        this.createConnections();
        this.addEventListeners();
        this.animate();
    }
    
    resize() {
        const container = document.getElementById('canvas-container');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.radius = Math.min(this.canvas.width, this.canvas.height) * 0.42;
        
        if (this.nodes.length > 0) {
            this.updateNodePositions();
        }
    }
    
    createNodes() {
        this.nodes = [];
        
        // 12组和弦链，每组5个节点在同一角度
        // 第1组角度-90度(12点方向)，然后顺时针每30度一组
        this.createChordChains();
    }
    
    createChordChains() {
        // 12组和弦链定义
        // 大和弦在角度-90, -60, -30... 小和弦在两者之间（偏移+15度）
        // 每组：Eø(最内层) -> A7(内层红) -> Dm(外层小) -> G7(外层橙) -> C(外层大)
        const chordChains = [
            // 第1组 - C在-90度，Dm在-105度（位于F和C之间）
            {
                angle: -90,
                chords: [
                    { name: 'Eø', layer: 'halfDim', type: 'halfDim', r: 0.25, angleOffset: 0 },
                    { name: 'A7', layer: 'dom7_1', type: 'dom7_1', r: 0.5, angleOffset: 0 },
                    { name: 'Dm', layer: 'outer', type: 'minor', r: 1.0, angleOffset: -15 },  // 小和弦在F和C中间
                    { name: 'G7', layer: 'dom7_2', type: 'dom7_2', r: 0.75, angleOffset: 0 },
                    { name: 'C', layer: 'outer', type: 'major', r: 1.0, angleOffset: 0 }   // 大和弦保持原角度
                ]
            },
            // 第2组 - G在-60度，Am在-75度
            {
                angle: -60,
                chords: [
                    { name: 'Bø', layer: 'halfDim', type: 'halfDim', r: 0.25, angleOffset: 0 },
                    { name: 'E7', layer: 'dom7_1', type: 'dom7_1', r: 0.5, angleOffset: 0 },
                    { name: 'Am', layer: 'outer', type: 'minor', r: 1.0, angleOffset: -15 },
                    { name: 'D7', layer: 'dom7_2', type: 'dom7_2', r: 0.75, angleOffset: 0 },
                    { name: 'G', layer: 'outer', type: 'major', r: 1.0, angleOffset: 0 }
                ]
            },
            // 第3组 - D在-30度，Em在-45度
            {
                angle: -30,
                chords: [
                    { name: 'F#ø', layer: 'halfDim', type: 'halfDim', r: 0.25, angleOffset: 0 },
                    { name: 'B7', layer: 'dom7_1', type: 'dom7_1', r: 0.5, angleOffset: 0 },
                    { name: 'Em', layer: 'outer', type: 'minor', r: 1.0, angleOffset: -15 },
                    { name: 'A7', layer: 'dom7_2', type: 'dom7_2', r: 0.75, angleOffset: 0 },
                    { name: 'D', layer: 'outer', type: 'major', r: 1.0, angleOffset: 0 }
                ]
            },
            // 第4组 - A在0度，Bm在-15度
            {
                angle: 0,
                chords: [
                    { name: 'Dbø', layer: 'halfDim', type: 'halfDim', r: 0.25, angleOffset: 0 },
                    { name: 'F#7', layer: 'dom7_1', type: 'dom7_1', r: 0.5, angleOffset: 0 },
                    { name: 'Bm', layer: 'outer', type: 'minor', r: 1.0, angleOffset: -15 },
                    { name: 'E7', layer: 'dom7_2', type: 'dom7_2', r: 0.75, angleOffset: 0 },
                    { name: 'A', layer: 'outer', type: 'major', r: 1.0, angleOffset: 0 }
                ]
            },
            // 第5组 - E在30度，F#m在15度
            {
                angle: 30,
                chords: [
                    { name: 'Abø', layer: 'halfDim', type: 'halfDim', r: 0.25, angleOffset: 0 },
                    { name: 'Db7', layer: 'dom7_1', type: 'dom7_1', r: 0.5, angleOffset: 0 },
                    { name: 'F#m', layer: 'outer', type: 'minor', r: 1.0, angleOffset: -15 },
                    { name: 'B7', layer: 'dom7_2', type: 'dom7_2', r: 0.75, angleOffset: 0 },
                    { name: 'E', layer: 'outer', type: 'major', r: 1.0, angleOffset: 0 }
                ]
            },
            // 第6组 - B在60度，Dbm在45度
            {
                angle: 60,
                chords: [
                    { name: 'Ebø', layer: 'halfDim', type: 'halfDim', r: 0.25, angleOffset: 0 },
                    { name: 'Ab7', layer: 'dom7_1', type: 'dom7_1', r: 0.5, angleOffset: 0 },
                    { name: 'Dbm', layer: 'outer', type: 'minor', r: 1.0, angleOffset: -15 },
                    { name: 'F#7', layer: 'dom7_2', type: 'dom7_2', r: 0.75, angleOffset: 0 },
                    { name: 'B', layer: 'outer', type: 'major', r: 1.0, angleOffset: 0 }
                ]
            },
            // 第7组 - F#在90度，Abm在75度
            {
                angle: 90,
                chords: [
                    { name: 'Bbø', layer: 'halfDim', type: 'halfDim', r: 0.25, angleOffset: 0 },
                    { name: 'Eb7', layer: 'dom7_1', type: 'dom7_1', r: 0.5, angleOffset: 0 },
                    { name: 'Abm', layer: 'outer', type: 'minor', r: 1.0, angleOffset: -15 },
                    { name: 'Db7', layer: 'dom7_2', type: 'dom7_2', r: 0.75, angleOffset: 0 },
                    { name: 'F#', layer: 'outer', type: 'major', r: 1.0, angleOffset: 0 }
                ]
            },
            // 第8组 - Db在120度，Ebm在105度
            {
                angle: 120,
                chords: [
                    { name: 'Fø', layer: 'halfDim', type: 'halfDim', r: 0.25, angleOffset: 0 },
                    { name: 'Bb7', layer: 'dom7_1', type: 'dom7_1', r: 0.5, angleOffset: 0 },
                    { name: 'Ebm', layer: 'outer', type: 'minor', r: 1.0, angleOffset: -15 },
                    { name: 'Ab7', layer: 'dom7_2', type: 'dom7_2', r: 0.75, angleOffset: 0 },
                    { name: 'Db', layer: 'outer', type: 'major', r: 1.0, angleOffset: 0 }
                ]
            },
            // 第9组 - Ab在150度，Bbm在135度
            {
                angle: 150,
                chords: [
                    { name: 'Cø', layer: 'halfDim', type: 'halfDim', r: 0.25, angleOffset: 0 },
                    { name: 'F7', layer: 'dom7_1', type: 'dom7_1', r: 0.5, angleOffset: 0 },
                    { name: 'Bbm', layer: 'outer', type: 'minor', r: 1.0, angleOffset: -15 },
                    { name: 'Eb7', layer: 'dom7_2', type: 'dom7_2', r: 0.75, angleOffset: 0 },
                    { name: 'Ab', layer: 'outer', type: 'major', r: 1.0, angleOffset: 0 }
                ]
            },
            // 第10组 - Eb在180度，Fm在165度
            {
                angle: 180,
                chords: [
                    { name: 'Gø', layer: 'halfDim', type: 'halfDim', r: 0.25, angleOffset: 0 },
                    { name: 'C7', layer: 'dom7_1', type: 'dom7_1', r: 0.5, angleOffset: 0 },
                    { name: 'Fm', layer: 'outer', type: 'minor', r: 1.0, angleOffset: -15 },
                    { name: 'Bb7', layer: 'dom7_2', type: 'dom7_2', r: 0.75, angleOffset: 0 },
                    { name: 'Eb', layer: 'outer', type: 'major', r: 1.0, angleOffset: 0 }
                ]
            },
            // 第11组 - Bb在210度，Cm在195度
            {
                angle: 210,
                chords: [
                    { name: 'Dø', layer: 'halfDim', type: 'halfDim', r: 0.25, angleOffset: 0 },
                    { name: 'G7', layer: 'dom7_1', type: 'dom7_1', r: 0.5, angleOffset: 0 },
                    { name: 'Cm', layer: 'outer', type: 'minor', r: 1.0, angleOffset: -15 },
                    { name: 'F7', layer: 'dom7_2', type: 'dom7_2', r: 0.75, angleOffset: 0 },
                    { name: 'Bb', layer: 'outer', type: 'major', r: 1.0, angleOffset: 0 }
                ]
            },
            // 第12组 - F在240度，Gm在225度
            {
                angle: 240,
                chords: [
                    { name: 'Aø', layer: 'halfDim', type: 'halfDim', r: 0.25, angleOffset: 0 },
                    { name: 'D7', layer: 'dom7_1', type: 'dom7_1', r: 0.5, angleOffset: 0 },
                    { name: 'Gm', layer: 'outer', type: 'minor', r: 1.0, angleOffset: -15 },
                    { name: 'C7', layer: 'dom7_2', type: 'dom7_2', r: 0.75, angleOffset: 0 },
                    { name: 'F', layer: 'outer', type: 'major', r: 1.0, angleOffset: 0 }
                ]
            }
        ];
        
        // 创建节点
        chordChains.forEach((chain, chainIndex) => {
            chain.chords.forEach((chord, chordIndex) => {
                const effectiveAngle = chain.angle + (chord.angleOffset || 0);
                const angleRad = effectiveAngle * Math.PI / 180;
                const r = this.radius * chord.r;
                const x = Math.cos(angleRad) * r;
                const y = Math.sin(angleRad) * r;
                
                let color;
                let radius;
                switch(chord.type) {
                    case 'major':
                        color = this.colors.major;
                        radius = 20;
                        break;
                    case 'minor':
                        color = this.colors.minor;
                        radius = 20;
                        break;
                    case 'dom7_1':
                        color = this.colors.dom7_1;
                        radius = 14;
                        break;
                    case 'dom7_2':
                        color = this.colors.dom7_2;
                        radius = 16;
                        break;
                    case 'halfDim':
                        color = this.colors.halfDim;
                        radius = 12;
                        break;
                }
                
                this.nodes.push({
                    id: `${chord.name}_${chord.layer}`,
                    name: chord.name,
                    layer: chord.layer,
                    type: chord.type,
                    chainIndex: chainIndex,
                    chordIndex: chordIndex,
                    angle: angleRad,
                    baseAngle: chain.angle * Math.PI / 180,  // 原始组角度
                    baseX: x,
                    baseY: y,
                    x: this.centerX + x,
                    y: this.centerY + y,
                    color: color,
                    radius: radius
                });
            });
        });
    }
    
    getNode(name, layer) {
        return this.nodes.find(n => n.name === name && n.layer === layer);
    }
    
    updateNodePositions() {
        this.nodes.forEach(node => {
            node.x = this.centerX + node.baseX;
            node.y = this.centerY + node.baseY;
        });
    }
    
    createConnections() {
        this.connections = [];
        
        // 每组内部的连接：Eø -> A7 -> Dm -> G7 -> C
        // 12组，每组4条连接，共48条连接
        const chordChains = [
            ['Eø', 'A7', 'Dm', 'G7', 'C'],
            ['Bø', 'E7', 'Am', 'D7', 'G'],
            ['F#ø', 'B7', 'Em', 'A7', 'D'],
            ['Dbø', 'F#7', 'Bm', 'E7', 'A'],
            ['Abø', 'Db7', 'F#m', 'B7', 'E'],
            ['Ebø', 'Ab7', 'Dbm', 'F#7', 'B'],
            ['Bbø', 'Eb7', 'Abm', 'Db7', 'F#'],
            ['Fø', 'Bb7', 'Ebm', 'Ab7', 'Db'],
            ['Cø', 'F7', 'Bbm', 'Eb7', 'Ab'],
            ['Gø', 'C7', 'Fm', 'Bb7', 'Eb'],
            ['Dø', 'G7', 'Cm', 'F7', 'Bb'],
            ['Aø', 'D7', 'Gm', 'C7', 'F']
        ];
        
        chordChains.forEach((chain, index) => {
            // Eø -> A7 (半减七 -> 属七1)
            this.addConnection(
                this.getNode(chain[0], 'halfDim'),
                this.getNode(chain[1], 'dom7_1'),
                'rgba(255, 0, 255, 0.9)',
                'chain-0-1'
            );
            
            // A7 -> Dm (属七1 -> 小三)
            this.addConnection(
                this.getNode(chain[1], 'dom7_1'),
                this.getNode(chain[2], 'outer'),
                'rgba(255, 0, 0, 0.9)',
                'chain-1-2'
            );
            
            // Dm -> G7 (小三 -> 属七2)
            this.addConnection(
                this.getNode(chain[2], 'outer'),
                this.getNode(chain[3], 'dom7_2'),
                'rgba(255, 170, 0, 0.9)',
                'chain-2-3'
            );
            
            // G7 -> C (属七2 -> 大三)
            this.addConnection(
                this.getNode(chain[3], 'dom7_2'),
                this.getNode(chain[4], 'outer'),
                'rgba(255, 136, 0, 0.9)',
                'chain-3-4'
            );
        });
        
        // 红色连红色：属七和弦1层（dom7_1）的循环连接
        // 属->主关系（逆时针，五度圈下降）：D7->G7->C7->F7->Bb7->Eb7->Ab7->Db7->F#7->B7->E7->A7->D7
        const dom7_1Chords = ['D7', 'G7', 'C7', 'F7', 'Bb7', 'Eb7', 'Ab7', 'Db7', 'F#7', 'B7', 'E7', 'A7'];
        for (let i = 0; i < dom7_1Chords.length; i++) {
            const from = dom7_1Chords[i];
            const to = dom7_1Chords[(i + 1) % dom7_1Chords.length];
            this.addConnection(
                this.getNode(from, 'dom7_1'),
                this.getNode(to, 'dom7_1'),
                'rgba(255, 0, 0, 0.6)',
                'dom7_1-cycle'
            );
        }
        
        // 橙色连橙色：属七和弦2层（dom7_2）的循环连接
        // 属->主关系（逆时针，五度圈下降）：C7->F7->Bb7->Eb7->Ab7->Db7->F#7->B7->E7->A7->D7->G7->C7
        const dom7_2Chords = ['C7', 'F7', 'Bb7', 'Eb7', 'Ab7', 'Db7', 'F#7', 'B7', 'E7', 'A7', 'D7', 'G7'];
        for (let i = 0; i < dom7_2Chords.length; i++) {
            const from = dom7_2Chords[i];
            const to = dom7_2Chords[(i + 1) % dom7_2Chords.length];
            this.addConnection(
                this.getNode(from, 'dom7_2'),
                this.getNode(to, 'dom7_2'),
                'rgba(255, 136, 0, 0.6)',
                'dom7_2-cycle'
            );
        }
        
        // G7->E7 和 G7->Am 连接，12组同理
        // 第1组: G7->E7, G7->Am
        this.addConnection(this.getNode('G7', 'dom7_2'), this.getNode('E7', 'dom7_1'), 'rgba(255, 200, 0, 0.8)', 'secondary-dominant');
        this.addConnection(this.getNode('G7', 'dom7_2'), this.getNode('Am', 'outer'), 'rgba(255, 136, 0, 0.8)', 'dom7_2-to-minor');
        
        // 第2组: D7->B7, D7->Em
        this.addConnection(this.getNode('D7', 'dom7_2'), this.getNode('B7', 'dom7_1'), 'rgba(255, 200, 0, 0.8)', 'secondary-dominant');
        this.addConnection(this.getNode('D7', 'dom7_2'), this.getNode('Em', 'outer'), 'rgba(255, 136, 0, 0.8)', 'dom7_2-to-minor');
        
        // 第3组: A7->F#7, A7->Bm
        this.addConnection(this.getNode('A7', 'dom7_2'), this.getNode('F#7', 'dom7_1'), 'rgba(255, 200, 0, 0.8)', 'secondary-dominant');
        this.addConnection(this.getNode('A7', 'dom7_2'), this.getNode('Bm', 'outer'), 'rgba(255, 136, 0, 0.8)', 'dom7_2-to-minor');
        
        // 第4组: E7->Db7, E7->F#m
        this.addConnection(this.getNode('E7', 'dom7_2'), this.getNode('Db7', 'dom7_1'), 'rgba(255, 200, 0, 0.8)', 'secondary-dominant');
        this.addConnection(this.getNode('E7', 'dom7_2'), this.getNode('F#m', 'outer'), 'rgba(255, 136, 0, 0.8)', 'dom7_2-to-minor');
        
        // 第5组: B7->Ab7, B7->Dbm
        this.addConnection(this.getNode('B7', 'dom7_2'), this.getNode('Ab7', 'dom7_1'), 'rgba(255, 200, 0, 0.8)', 'secondary-dominant');
        this.addConnection(this.getNode('B7', 'dom7_2'), this.getNode('Dbm', 'outer'), 'rgba(255, 136, 0, 0.8)', 'dom7_2-to-minor');
        
        // 第6组: F#7->Eb7, F#7->Abm
        this.addConnection(this.getNode('F#7', 'dom7_2'), this.getNode('Eb7', 'dom7_1'), 'rgba(255, 200, 0, 0.8)', 'secondary-dominant');
        this.addConnection(this.getNode('F#7', 'dom7_2'), this.getNode('Abm', 'outer'), 'rgba(255, 136, 0, 0.8)', 'dom7_2-to-minor');
        
        // 第7组: Db7->Bb7, Db7->Ebm
        this.addConnection(this.getNode('Db7', 'dom7_2'), this.getNode('Bb7', 'dom7_1'), 'rgba(255, 200, 0, 0.8)', 'secondary-dominant');
        this.addConnection(this.getNode('Db7', 'dom7_2'), this.getNode('Ebm', 'outer'), 'rgba(255, 136, 0, 0.8)', 'dom7_2-to-minor');
        
        // 第8组: Ab7->F7, Ab7->Bbm
        this.addConnection(this.getNode('Ab7', 'dom7_2'), this.getNode('F7', 'dom7_1'), 'rgba(255, 200, 0, 0.8)', 'secondary-dominant');
        this.addConnection(this.getNode('Ab7', 'dom7_2'), this.getNode('Bbm', 'outer'), 'rgba(255, 136, 0, 0.8)', 'dom7_2-to-minor');
        
        // 第9组: Eb7->C7, Eb7->Fm
        this.addConnection(this.getNode('Eb7', 'dom7_2'), this.getNode('C7', 'dom7_1'), 'rgba(255, 200, 0, 0.8)', 'secondary-dominant');
        this.addConnection(this.getNode('Eb7', 'dom7_2'), this.getNode('Fm', 'outer'), 'rgba(255, 136, 0, 0.8)', 'dom7_2-to-minor');
        
        // 第10组: Bb7->G7, Bb7->Cm
        this.addConnection(this.getNode('Bb7', 'dom7_2'), this.getNode('G7', 'dom7_1'), 'rgba(255, 200, 0, 0.8)', 'secondary-dominant');
        this.addConnection(this.getNode('Bb7', 'dom7_2'), this.getNode('Cm', 'outer'), 'rgba(255, 136, 0, 0.8)', 'dom7_2-to-minor');
        
        // 第11组: F7->D7, F7->Gm
        this.addConnection(this.getNode('F7', 'dom7_2'), this.getNode('D7', 'dom7_1'), 'rgba(255, 200, 0, 0.8)', 'secondary-dominant');
        this.addConnection(this.getNode('F7', 'dom7_2'), this.getNode('Gm', 'outer'), 'rgba(255, 136, 0, 0.8)', 'dom7_2-to-minor');
        
        // 第12组: C7->A7, C7->Dm
        this.addConnection(this.getNode('C7', 'dom7_2'), this.getNode('A7', 'dom7_1'), 'rgba(255, 200, 0, 0.8)', 'secondary-dominant');
        this.addConnection(this.getNode('C7', 'dom7_2'), this.getNode('Dm', 'outer'), 'rgba(255, 136, 0, 0.8)', 'dom7_2-to-minor');
        
        // 蓝色虚线：大和弦 -> 同主音小和弦（12组）
        // C->Cm, G->Gm, D->Dm, A->Am, E->Em, B->Bm, F#->F#m, Db->Dbm, Ab->Abm, Eb->Ebm, Bb->Bbm, F->Fm
        this.addConnection(this.getNode('C', 'outer'), this.getNode('Cm', 'outer'), 'rgba(100, 150, 255, 0.7)', 'major-to-minor', true);
        this.addConnection(this.getNode('G', 'outer'), this.getNode('Gm', 'outer'), 'rgba(100, 150, 255, 0.7)', 'major-to-minor', true);
        this.addConnection(this.getNode('D', 'outer'), this.getNode('Dm', 'outer'), 'rgba(100, 150, 255, 0.7)', 'major-to-minor', true);
        this.addConnection(this.getNode('A', 'outer'), this.getNode('Am', 'outer'), 'rgba(100, 150, 255, 0.7)', 'major-to-minor', true);
        this.addConnection(this.getNode('E', 'outer'), this.getNode('Em', 'outer'), 'rgba(100, 150, 255, 0.7)', 'major-to-minor', true);
        this.addConnection(this.getNode('B', 'outer'), this.getNode('Bm', 'outer'), 'rgba(100, 150, 255, 0.7)', 'major-to-minor', true);
        this.addConnection(this.getNode('F#', 'outer'), this.getNode('F#m', 'outer'), 'rgba(100, 150, 255, 0.7)', 'major-to-minor', true);
        this.addConnection(this.getNode('Db', 'outer'), this.getNode('Dbm', 'outer'), 'rgba(100, 150, 255, 0.7)', 'major-to-minor', true);
        this.addConnection(this.getNode('Ab', 'outer'), this.getNode('Abm', 'outer'), 'rgba(100, 150, 255, 0.7)', 'major-to-minor', true);
        this.addConnection(this.getNode('Eb', 'outer'), this.getNode('Ebm', 'outer'), 'rgba(100, 150, 255, 0.7)', 'major-to-minor', true);
        this.addConnection(this.getNode('Bb', 'outer'), this.getNode('Bbm', 'outer'), 'rgba(100, 150, 255, 0.7)', 'major-to-minor', true);
        this.addConnection(this.getNode('F', 'outer'), this.getNode('Fm', 'outer'), 'rgba(100, 150, 255, 0.7)', 'major-to-minor', true);
        
        // 白色虚线：大和弦 -> D7, G7, Am（下属功能连接，12组）
        // 白色虚线：大和弦 -> 上方大二度属七, 大和弦 -> 下方纯五度属七（12组）
        // 第1组: C -> D7, C -> G7
        this.addConnection(this.getNode('C', 'outer'), this.getNode('D7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        this.addConnection(this.getNode('C', 'outer'), this.getNode('G7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        
        // 第2组: G -> A7, G -> D7
        this.addConnection(this.getNode('G', 'outer'), this.getNode('A7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        this.addConnection(this.getNode('G', 'outer'), this.getNode('D7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        
        // 第3组: D -> E7, D -> A7
        this.addConnection(this.getNode('D', 'outer'), this.getNode('E7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        this.addConnection(this.getNode('D', 'outer'), this.getNode('A7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        
        // 第4组: A -> B7, A -> E7
        this.addConnection(this.getNode('A', 'outer'), this.getNode('B7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        this.addConnection(this.getNode('A', 'outer'), this.getNode('E7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        
        // 第5组: E -> F#7, E -> B7
        this.addConnection(this.getNode('E', 'outer'), this.getNode('F#7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        this.addConnection(this.getNode('E', 'outer'), this.getNode('B7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        
        // 第6组: B -> Db7, B -> F#7
        this.addConnection(this.getNode('B', 'outer'), this.getNode('Db7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        this.addConnection(this.getNode('B', 'outer'), this.getNode('F#7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        
        // 第7组: F# -> Ab7, F# -> Db7
        this.addConnection(this.getNode('F#', 'outer'), this.getNode('Ab7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        this.addConnection(this.getNode('F#', 'outer'), this.getNode('Db7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        
        // 第8组: Db -> Eb7, Db -> Ab7
        this.addConnection(this.getNode('Db', 'outer'), this.getNode('Eb7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        this.addConnection(this.getNode('Db', 'outer'), this.getNode('Ab7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        
        // 第9组: Ab -> Bb7, Ab -> Eb7
        this.addConnection(this.getNode('Ab', 'outer'), this.getNode('Bb7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        this.addConnection(this.getNode('Ab', 'outer'), this.getNode('Eb7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        
        // 第10组: Eb -> F7, Eb -> Bb7
        this.addConnection(this.getNode('Eb', 'outer'), this.getNode('F7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        this.addConnection(this.getNode('Eb', 'outer'), this.getNode('Bb7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        
        // 第11组: Bb -> C7, Bb -> F7
        this.addConnection(this.getNode('Bb', 'outer'), this.getNode('C7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        this.addConnection(this.getNode('Bb', 'outer'), this.getNode('F7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        
        // 第12组: F -> G7, F -> C7
        this.addConnection(this.getNode('F', 'outer'), this.getNode('G7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        this.addConnection(this.getNode('F', 'outer'), this.getNode('C7', 'dom7_2'), 'rgba(255, 255, 255, 0.6)', 'subdominant-function', true);
        
        // 红色虚线：小和弦 -> B7, 小和弦 -> E（Am为下属时的连接，12组）
        // 第1组: Am -> B7, Am -> E
        this.addConnection(this.getNode('Am', 'outer'), this.getNode('B7', 'dom7_1'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        this.addConnection(this.getNode('Am', 'outer'), this.getNode('E', 'outer'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        
        // 第2组: Em -> F#7, Em -> B
        this.addConnection(this.getNode('Em', 'outer'), this.getNode('F#7', 'dom7_1'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        this.addConnection(this.getNode('Em', 'outer'), this.getNode('B', 'outer'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        
        // 第3组: Bm -> Db7, Bm -> F#
        this.addConnection(this.getNode('Bm', 'outer'), this.getNode('Db7', 'dom7_1'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        this.addConnection(this.getNode('Bm', 'outer'), this.getNode('F#', 'outer'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        
        // 第4组: F#m -> Ab7, F#m -> Db
        this.addConnection(this.getNode('F#m', 'outer'), this.getNode('Ab7', 'dom7_1'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        this.addConnection(this.getNode('F#m', 'outer'), this.getNode('Db', 'outer'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        
        // 第5组: Dbm -> Eb7, Dbm -> Ab
        this.addConnection(this.getNode('Dbm', 'outer'), this.getNode('Eb7', 'dom7_1'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        this.addConnection(this.getNode('Dbm', 'outer'), this.getNode('Ab', 'outer'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        
        // 第6组: Abm -> Bb7, Abm -> Eb
        this.addConnection(this.getNode('Abm', 'outer'), this.getNode('Bb7', 'dom7_1'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        this.addConnection(this.getNode('Abm', 'outer'), this.getNode('Eb', 'outer'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        
        // 第7组: Ebm -> F7, Ebm -> Bb
        this.addConnection(this.getNode('Ebm', 'outer'), this.getNode('F7', 'dom7_1'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        this.addConnection(this.getNode('Ebm', 'outer'), this.getNode('Bb', 'outer'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        
        // 第8组: Bbm -> C7, Bbm -> F
        this.addConnection(this.getNode('Bbm', 'outer'), this.getNode('C7', 'dom7_1'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        this.addConnection(this.getNode('Bbm', 'outer'), this.getNode('F', 'outer'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        
        // 第9组: Fm -> G7, Fm -> C
        this.addConnection(this.getNode('Fm', 'outer'), this.getNode('G7', 'dom7_1'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        this.addConnection(this.getNode('Fm', 'outer'), this.getNode('C', 'outer'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        
        // 第10组: Cm -> D7, Cm -> G
        this.addConnection(this.getNode('Cm', 'outer'), this.getNode('D7', 'dom7_1'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        this.addConnection(this.getNode('Cm', 'outer'), this.getNode('G', 'outer'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        
        // 第11组: Gm -> A7, Gm -> D
        this.addConnection(this.getNode('Gm', 'outer'), this.getNode('A7', 'dom7_1'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        this.addConnection(this.getNode('Gm', 'outer'), this.getNode('D', 'outer'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        
        // 第12组: Dm -> E7, Dm -> A
        this.addConnection(this.getNode('Dm', 'outer'), this.getNode('E7', 'dom7_1'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        this.addConnection(this.getNode('Dm', 'outer'), this.getNode('A', 'outer'), 'rgba(255, 50, 50, 0.7)', 'minor-subdominant', true);
        
        // 蓝色连接：下属 -> 主（五度圈逆时针方向，12组）
        // 第1组: F -> C, F -> Am (F是C的下属)
        this.addConnection(this.getNode('F', 'outer'), this.getNode('C', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
        this.addConnection(this.getNode('F', 'outer'), this.getNode('Am', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
        
        // 第2组: C -> G, C -> Am (C是G的下属)
        this.addConnection(this.getNode('C', 'outer'), this.getNode('G', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
        this.addConnection(this.getNode('C', 'outer'), this.getNode('Am', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
        
        // 第3组: G -> D, G -> Bm (G是D的下属)
        this.addConnection(this.getNode('G', 'outer'), this.getNode('D', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
        this.addConnection(this.getNode('G', 'outer'), this.getNode('Bm', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
        
        // 第4组: D -> A, D -> F#m (D是A的下属)
        this.addConnection(this.getNode('D', 'outer'), this.getNode('A', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
        this.addConnection(this.getNode('D', 'outer'), this.getNode('F#m', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
        
        // 第5组: A -> E, A -> Dbm (A是E的下属)
        this.addConnection(this.getNode('A', 'outer'), this.getNode('E', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
        this.addConnection(this.getNode('A', 'outer'), this.getNode('Dbm', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
        
        // 第6组: E -> B, E -> Abm (E是B的下属)
        this.addConnection(this.getNode('E', 'outer'), this.getNode('B', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
        this.addConnection(this.getNode('E', 'outer'), this.getNode('Abm', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
        
        // 第7组: B -> F#, B -> Ebm (B是F#的下属)
        this.addConnection(this.getNode('B', 'outer'), this.getNode('F#', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
        this.addConnection(this.getNode('B', 'outer'), this.getNode('Ebm', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
        
        // 第8组: F# -> Db, F# -> Bbm (F#是Db的下属)
        this.addConnection(this.getNode('F#', 'outer'), this.getNode('Db', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
        this.addConnection(this.getNode('F#', 'outer'), this.getNode('Bbm', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
        
        // 第9组: Db -> Ab, Db -> Fm (Db是Ab的下属)
        this.addConnection(this.getNode('Db', 'outer'), this.getNode('Ab', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
        this.addConnection(this.getNode('Db', 'outer'), this.getNode('Fm', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
        
        // 第10组: Ab -> Eb, Ab -> Cm (Ab是Eb的下属)
        this.addConnection(this.getNode('Ab', 'outer'), this.getNode('Eb', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
        this.addConnection(this.getNode('Ab', 'outer'), this.getNode('Cm', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
        
        // 第11组: Eb -> Bb, Eb -> Gm (Eb是Bb的下属)
        this.addConnection(this.getNode('Eb', 'outer'), this.getNode('Bb', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
        this.addConnection(this.getNode('Eb', 'outer'), this.getNode('Gm', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
        
        // 第12组: Bb -> F, Bb -> Dm (Bb是F的下属)
        this.addConnection(this.getNode('Bb', 'outer'), this.getNode('F', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
        this.addConnection(this.getNode('Bb', 'outer'), this.getNode('Dm', 'outer'), 'rgba(100, 150, 255, 0.8)', 'subdominant-blue', false);
    }
    
    addConnection(from, to, color, type, dashed = false) {
        if (from && to) {
            this.connections.push({
                from: from,
                to: to,
                color: color,
                type: type,
                animated: true,
                dashed: dashed
            });
        }
    }
    
    addEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.hoveredNode = null;
            for (const node of this.nodes) {
                const dx = x - node.x;
                const dy = y - node.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < node.radius + 5) {
                    this.hoveredNode = node;
                    break;
                }
            }
            
            this.updateInfoPanel();
        });
    }
    
    updateInfoPanel() {
        const panel = document.getElementById('info-panel');
        const nameEl = document.getElementById('chord-name');
        const infoEl = document.getElementById('chord-info');
        
        if (this.hoveredNode) {
            panel.style.display = 'block';
            nameEl.textContent = this.hoveredNode.name;
            infoEl.innerHTML = this.getChordInfo(this.hoveredNode);
        } else {
            panel.style.display = 'none';
        }
    }
    
    getChordInfo(node) {
        const layerNames = {
            'outer': '外层（大小三和弦）',
            'dom7_1': '内层（属七和弦1-红色）',
            'dom7_2': '中层（属七和弦2-橙色）',
            'halfDim': '最内层（半减七和弦）'
        };
        
        const typeNames = {
            'major': '大三和弦',
            'minor': '小三和弦',
            'dom7_1': '属七和弦1',
            'dom7_2': '属七和弦2',
            'halfDim': '半减七和弦'
        };
        
        let info = `<strong>层级:</strong> ${layerNames[node.layer] || '未知'}<br>`;
        info += `<strong>类型:</strong> ${typeNames[node.type] || '其他'}<br>`;
        
        const outgoing = this.connections.filter(c => c.from.id === node.id);
        if (outgoing.length > 0) {
            info += `<br><strong>可进行的和弦:</strong><br>`;
            outgoing.forEach(c => {
                info += `→ ${c.to.name}<br>`;
            });
        }
        
        const incoming = this.connections.filter(c => c.to.id === node.id);
        if (incoming.length > 0) {
            info += `<br><strong>来自:</strong><br>`;
            incoming.forEach(c => {
                info += `← ${c.from.name}<br>`;
            });
        }
        
        return info;
    }
    
    draw() {
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawBackgroundRings();
        this.drawConnections();
        this.drawNodes();
        this.drawLabels();
    }
    
    drawBackgroundRings() {
        this.ctx.strokeStyle = 'rgba(100, 100, 100, 0.15)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        
        // 绘制同心圆
        [1.0, 0.75, 0.5, 0.25].forEach(ratio => {
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, this.radius * ratio, 0, Math.PI * 2);
            this.ctx.stroke();
        });
        
        // 绘制放射线（12条，对应12组）
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30 - 90) * Math.PI / 180;
            this.ctx.beginPath();
            this.ctx.moveTo(this.centerX, this.centerY);
            this.ctx.lineTo(
                this.centerX + Math.cos(angle) * this.radius,
                this.centerY + Math.sin(angle) * this.radius
            );
            this.ctx.stroke();
        }
        
        this.ctx.setLineDash([]);
    }
    
    drawConnections() {
        const time = Date.now() / 1000;
        
        this.connections.forEach((conn, index) => {
            this.ctx.strokeStyle = conn.color;
            this.ctx.lineWidth = 2;
            
            // 设置虚线样式
            if (conn.dashed) {
                this.ctx.setLineDash([5, 5]);
            } else {
                this.ctx.setLineDash([]);
            }
            
            if (this.hoveredNode && 
                (conn.from.id === this.hoveredNode.id || conn.to.id === this.hoveredNode.id)) {
                this.ctx.lineWidth = 4;
                this.ctx.globalAlpha = 1;
            } else {
                this.ctx.globalAlpha = 0.8;
            }
            
            // 使用折线连接避免交叉
            this.drawPolylineConnection(conn);
            this.ctx.globalAlpha = 1;
            this.ctx.setLineDash([]);
            
            // 绘制动画箭头
            if (conn.animated && this.hoveredNode && 
                (conn.from.id === this.hoveredNode.id || conn.to.id === this.hoveredNode.id)) {
                this.drawAnimatedArrow(conn, time, index);
            }
        });
    }
    
    drawPolylineConnection(conn) {
        const from = conn.from;
        const to = conn.to;
        
        // 判断是否需要折线连接
        // 当小和弦和大和弦在同一组但角度不同时，使用折线
        const sameChain = from.chainIndex === to.chainIndex;
        const needsPolyline = sameChain && from.type === 'minor' && to.type === 'major';
        
        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        
        if (needsPolyline) {
            // 使用折线：从 minor -> 中间点 -> major
            // 中间点使用相同的半径但取平均角度
            const midRadius = (Math.sqrt(from.baseX * from.baseX + from.baseY * from.baseY) + 
                              Math.sqrt(to.baseX * to.baseX + to.baseY * to.baseY)) / 2;
            const midAngle = (from.angle + to.angle) / 2;
            const midX = this.centerX + Math.cos(midAngle) * midRadius;
            const midY = this.centerY + Math.sin(midAngle) * midRadius;
            
            this.ctx.lineTo(midX, midY);
        }
        
        this.ctx.lineTo(to.x, to.y);
        this.ctx.stroke();
    }
    
    drawAnimatedArrow(conn, time, index) {
        const offset = (time * 0.5 + index * 0.05) % 1;
        const x = conn.from.x + (conn.to.x - conn.from.x) * offset;
        const y = conn.from.y + (conn.to.y - conn.from.y) * offset;
        
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 4, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawNodes() {
        this.nodes.forEach(node => {
            // 节点光晕（悬停时）
            if (node === this.hoveredNode) {
                const gradient = this.ctx.createRadialGradient(
                    node.x, node.y, 0,
                    node.x, node.y, node.radius + 10
                );
                gradient.addColorStop(0, node.color + '60');
                gradient.addColorStop(1, 'transparent');
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, node.radius + 10, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // 节点主体
            const gradient = this.ctx.createRadialGradient(
                node.x - 3, node.y - 3, 0,
                node.x, node.y, node.radius
            );
            gradient.addColorStop(0, node.color);
            gradient.addColorStop(1, this.darkenColor(node.color));
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 节点边框
            this.ctx.strokeStyle = node === this.hoveredNode ? '#fff' : node.color;
            this.ctx.lineWidth = node === this.hoveredNode ? 2 : 1.5;
            this.ctx.stroke();
        });
    }
    
    drawLabels() {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 11px "Microsoft YaHei", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
        this.ctx.shadowBlur = 3;
        
        this.nodes.forEach(node => {
            if (node.layer === 'outer') {
                this.ctx.font = 'bold 12px "Microsoft YaHei", sans-serif';
            } else if (node.layer === 'dom7_2') {
                this.ctx.font = 'bold 11px "Microsoft YaHei", sans-serif';
            } else if (node.layer === 'dom7_1') {
                this.ctx.font = 'bold 10px "Microsoft YaHei", sans-serif';
            } else {
                this.ctx.font = '9px "Microsoft YaHei", sans-serif';
            }
            this.ctx.fillText(node.name, node.x, node.y);
        });
        
        this.ctx.shadowBlur = 0;
    }
    
    darkenColor(color) {
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgb(${Math.floor(r * 0.7)}, ${Math.floor(g * 0.7)}, ${Math.floor(b * 0.7)})`;
        }
        return color;
    }
    
    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CircleOfFifths();
});
