//
//  GameScene.swift
//  Rect
//
//  Created by Peter Zhu on 15/10/31.
//  Copyright (c) 2015年 Peter Zhu. All rights reserved.
//

import SpriteKit

enum BodyType: UInt32 {
    case player = 1
    case ground = 2
    case door = 4
    case bodyPart = 8
    case button = 16
    case enemy = 32
    case refillBody = 64
    case all = 1023
}

class GameScene: SKScene, SKPhysicsContactDelegate {
    
    var levelNum: Int = 1
    var player = Player()
    var map = JSTileMap(named: "level1.tmx")
    var leftButton = SKSpriteNode(color: UIColor(red: 255, green: 255, blue: 255, alpha: 0.5), size: CGSizeMake(100, 1000))
    var rightButton = SKSpriteNode(color: UIColor(red: 255, green: 255, blue: 255, alpha: 0.5), size: CGSizeMake(100, 1000))
    var jumpButton = SKSpriteNode(color: UIColor(red: 255, green: 255, blue: 255, alpha: 0.5), size: CGSizeMake(100, 1000))
    var finalTouchName = ""
    var viewScale: CGFloat = 1
    
    override func didMoveToView(view: SKView) {
        /* Setup your scene here */
        
        self.physicsWorld.contactDelegate = self
        
        self.backgroundColor = SKColor.blackColor()
        self.view?.multipleTouchEnabled = true
        
        self.anchorPoint = CGPoint(x: 0.5, y: 0.5)
        self.position = CGPoint(x: 0, y: 0) //Change the scenes anchor point to the bottom left and position it correctly
        self.size = CGSizeMake(self.size.width / viewScale, self.size.height / viewScale)
        
        //let rect = map.calculateAccumulatedFrame() //This is not necessarily needed but returns the CGRect actually used by the tileMap, not just the space it could take up. You may want to use it later
        map.position = CGPoint(x: 0, y: 0) //Position in the bottom left
        map.setScale(1)
        map.name = "map"
        self.addChild(map!)
        
        addFloor()
        
        self.player.position = CGPointMake(150, map.calculateAccumulatedFrame().height - 274)
        self.map.addChild(self.player)
        
        let overLay = SKSpriteNode(color: UIColor(red: 0, green: 0, blue: 0, alpha: 0), size: CGSizeMake(self.frame.width, self.frame.height))
        overLay.name = "overLay"
        overLay.zPosition = 98
        self.addChild(overLay)
        
        leftButton.name = "leftButton"
        leftButton.position = CGPointMake(-self.frame.width / 2 + (50 / viewScale), 0)
        leftButton.size = CGSizeMake(100 / viewScale, self.frame.height)
        leftButton.zPosition = 100
        self.addChild(leftButton)
        
        rightButton.name = "rightButton"
        rightButton.position = CGPointMake(self.frame.width / 2 - (50 / viewScale), 0)
        rightButton.size = CGSizeMake(100 / viewScale, self.frame.height)
        rightButton.zPosition = 99
        self.addChild(rightButton)
        
        jumpButton.name = "jumpButton"
        jumpButton.position = CGPointMake(0, -self.frame.height / 2 + (150 / viewScale))
        jumpButton.size = CGSizeMake(self.frame.width, 100 / viewScale)
        jumpButton.zPosition = 101
        self.addChild(jumpButton)
    }
    
    func loadLevel(level: Int) {
        player.removeAllActions()
        
        map.removeFromParent()
        player.removeFromParent()
        
        map = JSTileMap(named: "level" + String(level) + ".tmx")
        self.player.position = CGPointMake(150, map.calculateAccumulatedFrame().height - 274)
        self.player.refill()
        self.addChild(self.map)
        addFloor()
        self.map.addChild(self.player)
    }
    
    func reScale() {
        self.size = CGSizeMake(self.size.width / viewScale, self.size.height / viewScale)
        leftButton.position = CGPointMake(-self.frame.width / 2 + (50 / viewScale), 0)
        leftButton.size = CGSizeMake(100 / viewScale, self.frame.height)
        rightButton.position = CGPointMake(self.frame.width / 2 - (50 / viewScale), 0)
        rightButton.size = CGSizeMake(100 / viewScale, self.frame.height)
        jumpButton.position = CGPointMake(0, -self.frame.height / 2 + (150 / viewScale))
        jumpButton.size = CGSizeMake(self.frame.width, 100 / viewScale)
    }
    
    override func didFinishUpdate() {
        self.centerOnNode(player)//self.childNodeWithName("worldCamera")!)
        //player.parent!.position = player.position
    }
    
    func centerOnNode(node: SKNode) {
        let cameraPositionInScene: CGPoint = (node.scene?.convertPoint(node.position, fromNode: node.parent!))!
        node.parent!.position = CGPointMake(node.parent!.position.x - cameraPositionInScene.x, node.parent!.position.y - cameraPositionInScene.y)
    }
    
    func addFloor() {
        for objectGroup in self.map.objectGroups{
            if objectGroup.groupName == "Collision" {
                for object in (objectGroup.objects as NSArray) {
                    let nodeWidth = CGFloat(((object.valueForKey("width")! as AnyObject) as! NSString).doubleValue)
                    let nodeHeight = CGFloat(((object.valueForKey("height")! as AnyObject) as! NSString).doubleValue)
                    let nodeX = CGFloat((object.valueForKey("x")! as AnyObject) as! NSNumber)
                    let nodeY = CGFloat((object.valueForKey("y")! as AnyObject) as! NSNumber)
                    
                    let node = SKSpriteNode(color: UIColor(red: 0, green: 0, blue: 0, alpha: 1), size: CGSize(width: nodeWidth, height: nodeHeight))
                    node.name = "ground"
                    node.position = CGPointMake(nodeX + nodeWidth / 2, nodeY + nodeHeight / 2)
                    node.physicsBody = SKPhysicsBody(rectangleOfSize: CGSize(width: nodeWidth, height: nodeHeight))
                    node.physicsBody!.dynamic = false
                    node.physicsBody?.pinned = true
                    node.physicsBody?.usesPreciseCollisionDetection = true
                    node.physicsBody?.friction = 0
                    node.physicsBody?.restitution = 0
                    node.physicsBody?.categoryBitMask = BodyType.ground.rawValue
                    node.physicsBody?.contactTestBitMask = BodyType.all.rawValue
                    node.physicsBody?.collisionBitMask = BodyType.all.rawValue
                    
                    self.map.addChild(node)
                }
            } else if objectGroup.groupName == "door" {
                for object in (objectGroup.objects as NSArray) {
                    let nodeWidth = CGFloat(((object.valueForKey("width")! as AnyObject) as! NSString).doubleValue)
                    let nodeHeight = CGFloat(((object.valueForKey("height")! as AnyObject) as! NSString).doubleValue)
                    let nodeX = CGFloat((object.valueForKey("x")! as AnyObject) as! NSNumber)
                    let nodeY = CGFloat((object.valueForKey("y")! as AnyObject) as! NSNumber)
                    
                    let node = SKSpriteNode(color: UIColor(red: 0, green: 0, blue: 0, alpha: 0), size: CGSize(width: nodeWidth, height: nodeHeight))
                    node.name = "door"
                    node.position = CGPointMake(nodeX + nodeWidth / 2, nodeY + nodeHeight / 2)
                    node.physicsBody = SKPhysicsBody(rectangleOfSize: CGSize(width: nodeWidth, height: nodeHeight))
                    node.physicsBody?.affectedByGravity = false
                    node.physicsBody!.dynamic = false
                    node.physicsBody?.pinned = true
                    node.physicsBody?.usesPreciseCollisionDetection = true
                    node.physicsBody?.friction = 0
                    node.physicsBody?.restitution = 0
                    node.physicsBody?.categoryBitMask = BodyType.door.rawValue
                    node.physicsBody?.contactTestBitMask = BodyType.all.rawValue
                    node.physicsBody?.collisionBitMask = BodyType.all.rawValue
                    
                    self.map.addChild(node)
                }
            } else if objectGroup.groupName == "lift" {
                for object in (objectGroup.objects as NSArray) {
                    let nodeWidth = CGFloat(((object.valueForKey("width")! as AnyObject) as! NSString).doubleValue)
                    let nodeHeight = CGFloat(((object.valueForKey("height")! as AnyObject) as! NSString).doubleValue)
                    let nodeX = CGFloat((object.valueForKey("x")! as AnyObject) as! NSNumber)
                    let nodeY = CGFloat((object.valueForKey("y")! as AnyObject) as! NSNumber)
                    let finalPos = Int(((object.valueForKey("finalPosition")! as AnyObject) as! NSString).doubleValue)
                    let pairButtonNum = Int(((object.valueForKey("buttonNum")! as AnyObject) as! NSString).doubleValue)
                    let liftDirection = String((object.valueForKey("direction")! as AnyObject) as! NSString)
                    
                    let node = lift(positionPt: CGPointMake(nodeX + nodeWidth / 2, nodeY + nodeHeight / 2), size: CGSizeMake(nodeWidth, nodeHeight))
                    node.name = "lift" + String(pairButtonNum)
                    node.matchButtonNum = pairButtonNum
                    node.finalPosition = finalPos as Int
                    node.direction = liftDirection
                    node.checkConditioningLift()
                    
                    self.map.addChild(node)
                }
            } else if objectGroup.groupName == "button" {
                for object in (objectGroup.objects as NSArray) {
                    let nodeWidth = CGFloat(((object.valueForKey("width")! as AnyObject) as! NSString).doubleValue)
                    let nodeHeight = CGFloat(((object.valueForKey("height")! as AnyObject) as! NSString).doubleValue)
                    let nodeX = CGFloat((object.valueForKey("x")! as AnyObject) as! NSNumber)
                    let nodeY = CGFloat((object.valueForKey("y")! as AnyObject) as! NSNumber)
                    let liftNum = Int(((object.valueForKey("liftNum")! as AnyObject) as! NSString).doubleValue)
                    
                    let node = button(positionPt: CGPointMake(nodeX + nodeWidth / 2, nodeY + nodeHeight / 2), size: CGSize(width: nodeWidth, height: nodeHeight))
                    node.name = "button"
                    node.matchLiftNum = liftNum
                    
                    self.map.addChild(node)
                }
            } else if objectGroup.groupName == "enemy" {
                for object in (objectGroup.objects as NSArray) {
                    let nodeWidth = CGFloat(((object.valueForKey("width")! as AnyObject) as! NSString).doubleValue)
                    let nodeHeight = CGFloat(((object.valueForKey("height")! as AnyObject) as! NSString).doubleValue)
                    let nodeX = CGFloat((object.valueForKey("x")! as AnyObject) as! NSNumber)
                    let nodeY = CGFloat((object.valueForKey("y")! as AnyObject) as! NSNumber)
                    
                    let node = enemy(positionPt: CGPointMake(nodeX + nodeHeight / 2, nodeY + nodeHeight / 2), range: CGSize(width: nodeWidth, height: nodeHeight))
                    node.name = "enemy"
                    
                    self.map.addChild(node)
                }
            } else if objectGroup.groupName == "refillBody" {
                for object in (objectGroup.objects as NSArray) {
                    let nodeWidth = CGFloat(((object.valueForKey("width")! as AnyObject) as! NSString).doubleValue)
                    let nodeHeight = CGFloat(((object.valueForKey("height")! as AnyObject) as! NSString).doubleValue)
                    let nodeX = CGFloat((object.valueForKey("x")! as AnyObject) as! NSNumber)
                    let nodeY = CGFloat((object.valueForKey("y")! as AnyObject) as! NSNumber)
                    
                    let node = refillBody(positionPt: CGPointMake(nodeX + nodeWidth / 2, nodeY + nodeHeight / 2), size: CGSizeMake(nodeWidth, nodeHeight))
                    node.name = "refillBody"
                    
                    self.map.addChild(node)
                }
            }
        }
    }
    
    override func touchesBegan(touches: Set<UITouch>, withEvent event: UIEvent?) {
       /* Called when a touch begins */
        var lastTouch = touches.first
        
        for touch in touches {
            if touch.timestamp > lastTouch!.timestamp {
                let location = touch.locationInNode(self)
                let node = self.nodeAtPoint(location)
                if node != map {
                    lastTouch = touch
                }
            }
        }
        
        let location = lastTouch!.locationInNode(self)
        let node = self.nodeAtPoint(location)
        switch node.name {
        case ("leftButton"?):
            player.removeAllActions()
            player.runAction(SKAction.repeatActionForever(SKAction.moveByX(-30, y: 0, duration: 0.1)))
        case ("rightButton"?):
            player.removeAllActions()
            player.runAction(SKAction.repeatActionForever(SKAction.moveByX(30, y: 0, duration: 0.1)))
        case ("jumpButton"?):
            if (player.physicsBody?.velocity.dy == 0) {
                player.physicsBody?.applyImpulse(CGVectorMake(0, 20 - CGFloat(player.bodySize) * 4))
            }
        case ("overLay"?):
            if player.shrink() {
                shootBodyPart(location)
            }
        default: true
        }
        if (node.name == "leftButton") || (node.name == "rightButton") {
            finalTouchName = node.name!
        }
        
    }
    
    override func touchesEnded(touches: Set<UITouch>, withEvent event: UIEvent?) {
        for touch in touches {
            let location = touch.locationInNode(self)
            let node = self.nodeAtPoint(location)
            
            if (node != map) {
                switch node.name! {
                case ("leftButton"), ("rightButton"):
                    if node.name == finalTouchName {
                        player.removeAllActions()
                    }
                default: true
                }
            }
        }
    }
    
    func didBeginContact(contact: SKPhysicsContact) {
        
        if (contact.bodyA.node != nil) && (contact.bodyB.node != nil) {
            let contactMask = contact.bodyA.categoryBitMask | contact.bodyB.categoryBitMask
            
            print(contactMask)
            
            switch contactMask {
            case (BodyType.player.rawValue | BodyType.door.rawValue):
                if player.bodySize == 1 {
                    levelNum++
                    loadLevel(levelNum)
                }
            case (BodyType.bodyPart.rawValue | BodyType.player.rawValue):
                if contact.bodyA.node?.name == "bodyPart" {
                    if (contact.bodyA.node as! bodyPart).collidedWithGround {
                        contact.bodyA.node?.removeFromParent()
                        player.enlarge()
                    }
                } else {
                    if (contact.bodyB.node as! bodyPart).collidedWithGround {
                        contact.bodyB.node?.removeFromParent()
                        player.enlarge()
                    }
                }
            case (BodyType.bodyPart.rawValue | BodyType.ground.rawValue):
                if contact.bodyA.node?.name == "bodyPart" {
                    contact.bodyA.node?.removeAllActions()
                    contact.bodyA.node?.physicsBody?.affectedByGravity = true
                    (contact.bodyA.node as! bodyPart).collidedWithGround = true
                    
                } else {
                    contact.bodyB.node?.removeAllActions()
                    contact.bodyB.node?.physicsBody?.affectedByGravity = true
                    (contact.bodyB.node as! bodyPart).collidedWithGround = true
                }
            case (BodyType.player.rawValue | BodyType.button.rawValue):
                if (contact.bodyA.node?.name == "button") {
                    let matchLiftName = "lift" + String((contact.bodyA.node as! button).matchLiftNum)
                    let matchLift = map.childNodeWithName(matchLiftName) as! lift
                    matchLift.moveLift()
                    
                } else {
                    let matchLiftName = "lift" + String((contact.bodyB.node as! button).matchLiftNum)
                    print(matchLiftName)
                    let matchLift = map.childNodeWithName(matchLiftName) as! lift
                    matchLift.moveLift()
                }
            case (BodyType.bodyPart.rawValue | BodyType.button.rawValue):
                if (contact.bodyA.node?.name == "button") {
                    let matchLiftName = "lift" + String((contact.bodyA.node as! button).matchLiftNum)
                    let matchLift = map.childNodeWithName(matchLiftName) as! lift
                    matchLift.moveLift()
                } else {
                    let matchLiftName = "lift" + String((contact.bodyB.node as! button).matchLiftNum)
                    print(matchLiftName)
                    let matchLift = map.childNodeWithName(matchLiftName) as! lift
                    matchLift.moveLift()
                }
                if contact.bodyA.node?.name == "bodyPart" {
                    contact.bodyA.node?.removeAllActions()
                    contact.bodyA.node?.physicsBody?.affectedByGravity = true
                    (contact.bodyA.node as! bodyPart).collidedWithGround = true
                    
                } else {
                    contact.bodyB.node?.removeAllActions()
                    contact.bodyB.node?.physicsBody?.affectedByGravity = true
                    (contact.bodyB.node as! bodyPart).collidedWithGround = true
                }
            case (BodyType.bodyPart.rawValue | BodyType.enemy.rawValue):
                print(contact.bodyA.node, contact.bodyB.node)
                if (contact.bodyA.node?.name == "enemy") {
                    if !(contact.bodyB.node as! bodyPart).usedOnEnemy {
                        (contact.bodyA.node as! enemy).hitted()
                        (contact.bodyB.node as! bodyPart).usedOnEnemy = true
                    }
                } else {
                    if !(contact.bodyA.node as! bodyPart).usedOnEnemy {
                        (contact.bodyB.node as! enemy).hitted()
                        (contact.bodyA.node as! bodyPart).usedOnEnemy = true
                    }
                }
                if contact.bodyA.node?.name == "bodyPart" {
                    contact.bodyA.node?.removeAllActions()
                    contact.bodyA.node?.physicsBody?.affectedByGravity = true
                    (contact.bodyA.node as! bodyPart).collidedWithGround = true
                    
                } else {
                    contact.bodyB.node?.removeAllActions()
                    contact.bodyB.node?.physicsBody?.affectedByGravity = true
                    (contact.bodyB.node as! bodyPart).collidedWithGround = true
                }
            case (BodyType.player.rawValue | BodyType.enemy.rawValue):
                loadLevel(levelNum)
            case (BodyType.player.rawValue | BodyType.refillBody.rawValue):
                player.refill()
                if contact.bodyA.node?.name == "refillBody" {
                    contact.bodyA.node?.removeFromParent()
                } else {
                    contact.bodyB.node?.removeFromParent()
                }
            default: true
            }
        }
        
    }
    
    func didEndContact(contact: SKPhysicsContact) {
        let contactMask = contact.bodyA.categoryBitMask | contact.bodyB.categoryBitMask
        
        switch contactMask {
        case (BodyType.player.rawValue | BodyType.ground.rawValue):
            true
        case (BodyType.player.rawValue | BodyType.door.rawValue):
            print("next level")
        default: true
        }
    }
    
    func shootBodyPart(location: CGPoint) {
        let aBodyPart = bodyPart()
        let position = CGPointMake(player.position.x, player.position.y + player.frame.height - aBodyPart.frame.height)
        aBodyPart.position = position
        aBodyPart.runAction(SKAction.repeatActionForever(SKAction.moveBy(CGVector(dx: (self.map.convertPoint(location, fromNode: self.scene!).x - aBodyPart.position.x), dy: (self.map.convertPoint(location, fromNode: self.scene!).y) - aBodyPart.position.y), duration: 1)))
        self.map.addChild(aBodyPart)
    }
    
    override func update(currentTime: CFTimeInterval) {
        /* Called before each frame is rendered */
    }
}
