//
//  Player.swift
//  Rect
//
//  Created by Peter Zhu on 15/10/31.
//  Copyright © 2015年 Peter Zhu. All rights reserved.
//

import UIKit
import SpriteKit

class Player: SKSpriteNode{
    var groundCount = 0
    var bodySize = 1 // 1 is largest, 4 smallest
    
    init() {
        super.init(texture: SKTexture(imageNamed: "player1"), color: UIColor(red: 0, green: 0, blue: 0, alpha: 0), size: CGSizeMake(20, 32))
        self.name = "player"
        configPhysicsBody()
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    func shrink() -> Bool {
        if bodySize < 4 {
            bodySize++
            self.texture = SKTexture(imageNamed: ("player" + String(bodySize)))
            self.size = (self.texture?.size())!
            configPhysicsBody()
            return true
        } else {
            return false
        }
    }
    
    func enlarge() -> Bool {
        if bodySize > 1 {
            bodySize--
            self.texture = SKTexture(imageNamed: ("player" + String(bodySize)))
            self.size = (self.texture?.size())!
            configPhysicsBody()
            return true
        } else {
            return false
        }
    }
    
    func refill() {
        bodySize = 1
        self.texture = SKTexture(imageNamed: "player" + String(bodySize))
        self.size = (self.texture?.size())!
        configPhysicsBody()
    }
    
    func configPhysicsBody() {
        self.physicsBody = SKPhysicsBody(rectangleOfSize: self.size)
        self.physicsBody?.affectedByGravity = true
        self.physicsBody?.allowsRotation = false
        self.physicsBody?.usesPreciseCollisionDetection = true
        self.physicsBody?.friction = 0
        self.physicsBody?.restitution = 0
        //self.physicsBody?.mass = CGFloat(bodySize)
        //print(self.physicsBody?.area)
        self.physicsBody?.dynamic = true
        self.physicsBody?.categoryBitMask = BodyType.player.rawValue
        self.physicsBody?.contactTestBitMask = BodyType.all.rawValue
        self.physicsBody?.collisionBitMask = BodyType.all.rawValue
    }
}

class bodyPart: SKSpriteNode {
    
    var collidedWithGround = false
    var usedOnEnemy = false
    
    init() {
        super.init(texture: SKTexture(imageNamed: "bodyPart"), color: UIColor(red: 0, green: 0, blue: 255, alpha: 0), size: CGSizeMake(16, 7))
        
        self.name = "bodyPart"
        self.physicsBody = SKPhysicsBody(rectangleOfSize: self.size)
        self.physicsBody?.affectedByGravity = false
        self.physicsBody?.allowsRotation = false
        self.physicsBody?.dynamic = true
        self.physicsBody?.usesPreciseCollisionDetection = true
        self.physicsBody?.friction = 0
        self.physicsBody?.restitution = 0
        self.physicsBody?.categoryBitMask = BodyType.bodyPart.rawValue
        self.physicsBody?.contactTestBitMask = BodyType.all.rawValue
        self.physicsBody?.collisionBitMask = BodyType.all.rawValue
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}

class lift: SKSpriteNode {
    
    var matchButtonNum = 0
    var finalPosition = 0
    var direction = "up"
    var timerForCheckingEnemy = NSTimer()
    
    init(positionPt: CGPoint, size: CGSize) {
        super.init(texture: nil, color: UIColor(red: 0, green: 0, blue: 0, alpha: 1), size: size)
        
        self.color = UIColor.blackColor()
        self.position = positionPt
        self.physicsBody = SKPhysicsBody(rectangleOfSize: self.size)
        self.physicsBody?.affectedByGravity = false
        self.physicsBody!.dynamic = false
        self.physicsBody?.usesPreciseCollisionDetection = true
        self.physicsBody?.friction = 0
        self.physicsBody?.restitution = 0
        self.physicsBody?.categoryBitMask = BodyType.ground.rawValue
        self.physicsBody?.contactTestBitMask = BodyType.all.rawValue
        self.physicsBody?.collisionBitMask = BodyType.all.rawValue
    }
    
    func checkConditioningLift() {
        if (matchButtonNum == -1) {
            timerForCheckingEnemy = NSTimer.scheduledTimerWithTimeInterval(1, target: self, selector: "checkEnemyClear", userInfo: nil, repeats: true)
        }
    }
    
    func checkEnemyClear() {
        print("timer fire")
        if (self.parent?.childNodeWithName("enemy") == nil) {
            self.moveLift()
            timerForCheckingEnemy.invalidate()
        }
    }
    
    func moveLift() {
        if (direction == "up") || (direction == "down") {
            //nodeY + nodeHeight / 2
            self.runAction(SKAction.moveToY((self.parent?.calculateAccumulatedFrame().height)! - (CGFloat(self.finalPosition) + self.size.height - self.size.height / 2), duration: 1))
        } else if (direction == "left") || (direction == "right") {
            self.runAction(SKAction.moveToX(CGFloat(self.finalPosition) + self.size.width / 2, duration: 1))
        }
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
}

class button: SKSpriteNode {
    
    var matchLiftNum = 0
    
    init(positionPt: CGPoint, size: CGSize) {
        super.init(texture: nil, color: UIColor(red: 255, green: 255, blue: 255, alpha: 0), size: size)
        
        self.position = positionPt
        self.physicsBody = SKPhysicsBody(rectangleOfSize: self.size)
        self.physicsBody?.affectedByGravity = false
        self.physicsBody!.dynamic = false
        self.physicsBody?.pinned = true
        self.physicsBody?.usesPreciseCollisionDetection = true
        self.physicsBody?.friction = 0
        self.physicsBody?.restitution = 0
        self.physicsBody?.categoryBitMask = BodyType.button.rawValue
        self.physicsBody?.contactTestBitMask = BodyType.all.rawValue
        self.physicsBody?.collisionBitMask = BodyType.all.rawValue
        
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
}

class enemy: SKSpriteNode {
    
    var enemySize = 1
    
    init(positionPt: CGPoint, range: CGSize) {
        super.init(texture: SKTexture(imageNamed: "enemy1"), color: UIColor(red: 255, green: 255, blue: 255, alpha: 0), size: CGSizeMake(32, 32))
        
        self.name = "enemy"
        self.position = positionPt
        self.physicsBody = SKPhysicsBody(circleOfRadius: 16)
        self.physicsBody?.affectedByGravity = true
        self.physicsBody!.dynamic = true
        self.physicsBody?.usesPreciseCollisionDetection = true
        self.physicsBody?.friction = 0
        self.physicsBody?.restitution = 0
        self.physicsBody?.categoryBitMask = BodyType.enemy.rawValue
        self.physicsBody?.contactTestBitMask = BodyType.all.rawValue
        self.physicsBody?.collisionBitMask = BodyType.all.rawValue
        
        self.runAction(SKAction.repeatActionForever(SKAction.sequence([
            SKAction.moveToX(range.width + self.position.x, duration: 2),
            SKAction.moveToX(self.position.x, duration: 2)
            ])))
    }
    
    func hitted() {
        if enemySize < 2 {
            enemySize++
            self.texture = SKTexture(imageNamed: ("enemy" + String(enemySize)))
            self.size = (self.texture?.size())!
            self.name = "enemy"
            
            self.physicsBody = SKPhysicsBody(circleOfRadius: self.size.width / 2)
            self.physicsBody?.affectedByGravity = true
            self.physicsBody!.dynamic = true
            self.physicsBody?.usesPreciseCollisionDetection = true
            self.physicsBody?.friction = 0
            self.physicsBody?.restitution = 0
            self.physicsBody?.categoryBitMask = BodyType.enemy.rawValue
            self.physicsBody?.contactTestBitMask = BodyType.all.rawValue
            self.physicsBody?.collisionBitMask = BodyType.all.rawValue
        } else {
            self.removeFromParent()
        }
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}

class refillBody: SKSpriteNode {
    init(positionPt: CGPoint, size: CGSize) {
        super.init(texture: SKTexture(imageNamed: "refillBody"), color: UIColor(red: 58, green: 122, blue: 79, alpha: 1), size: size)
        
        //self.colorBlendFactor = 1
        self.color = UIColor(red: 58, green: 122, blue: 79, alpha: 1)
        self.name = "refillBody"
        self.position = positionPt
        self.physicsBody = SKPhysicsBody(rectangleOfSize: self.size)
        self.physicsBody?.affectedByGravity = false
        self.physicsBody!.dynamic = false
        self.physicsBody?.pinned = true
        self.physicsBody?.usesPreciseCollisionDetection = true
        self.physicsBody?.friction = 0
        self.physicsBody?.restitution = 0
        self.physicsBody?.categoryBitMask = BodyType.refillBody.rawValue
        self.physicsBody?.contactTestBitMask = BodyType.all.rawValue
        self.physicsBody?.collisionBitMask = BodyType.all.rawValue
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}