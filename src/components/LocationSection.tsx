"use client";

import { useRef } from "react";
import Image from "next/image";
import { CONTACT } from "@/data/villa";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  DUR,
  EASE,
  ScrollTrigger,
  drawPlan,
  gsap,
  prefersReducedMotion,
  revealUp,
  useGsap,
} from "@/lib/motion";

/* ------------------------------------------------------------------ *
 * The survey sheet.
 *
 * No mapping library, no tiles, no network request. Every contour is a
 * closed Catmull-Rom curve generated once from a low-frequency radial
 * noise function, so each ring nests inside the next and none of them can
 * ever cross — which is what makes the drawing read as a survey rather
 * than as decoration. Laid out on a 640 x 448 sheet:
 *
 *   RIDGE — the crest to the north-east, outermost ring first
 *   KNOLL — the smaller rise closing the south-east corner
 *   SHORE — two land contours stepping down toward the water
 *   LAKE  — the waterline itself
 * ------------------------------------------------------------------ */

const RIDGE = [
  "M 724.8 22.3 C 730.1 33 731.4 46.4 727.1 59.2 C 722.8 72 711.1 86.4 699 99 C 686.9 111.7 669.5 123.6 654.5 134.9 C 639.5 146.1 624.2 156.1 608.9 166.5 C 593.6 176.8 579.4 187.4 562.6 197 C 545.7 206.6 527.3 216.8 507.8 224.1 C 488.4 231.3 466.2 237.1 446 240.4 C 425.8 243.8 405.4 244.1 386.7 244.3 C 368 244.5 350.9 242.9 333.6 241.6 C 316.3 240.4 299.3 239.2 282.9 236.7 C 266.5 234.2 249.2 231.5 235.2 226.6 C 221.1 221.7 208.2 215 198.6 207.1 C 189 199.2 182.6 189.4 177.4 179.3 C 172.3 169.2 169 158.2 167.8 146.5 C 166.6 134.8 165.6 122.1 170.1 109.2 C 174.6 96.2 181.8 81.5 194.6 68.7 C 207.4 55.9 226.8 42.5 246.8 32.5 C 266.8 22.5 292.5 14.8 314.5 8.7 C 336.5 2.6 358.9 -0.2 379 -4 C 399 -7.9 416.4 -10.6 434.8 -14.3 C 453.2 -18 470.7 -22.8 489.4 -26.1 C 508.1 -29.5 528.1 -33.2 547 -34.4 C 565.9 -35.6 585.1 -35.3 602.7 -33.4 C 620.3 -31.6 637.1 -27.9 652.6 -23.2 C 668 -18.5 683.6 -12.7 695.6 -5.2 C 707.7 2.4 719.6 11.6 724.8 22.3 Z",
  "M 658.2 41.4 C 662.2 49.6 663.2 59.9 659.9 69.7 C 656.6 79.5 647.6 90.5 638.4 100.2 C 629.1 109.9 615.8 119 604.3 127.6 C 592.8 136.3 581.1 143.9 569.4 151.9 C 557.6 159.8 546.8 167.9 533.9 175.3 C 521 182.6 506.8 190.4 492 196 C 477.1 201.5 460.1 205.9 444.6 208.5 C 429.2 211.1 413.5 211.3 399.2 211.5 C 384.8 211.6 371.8 210.4 358.5 209.4 C 345.3 208.4 332.2 207.6 319.7 205.7 C 307.1 203.7 293.9 201.7 283.1 197.9 C 272.3 194.1 262.5 189 255.1 182.9 C 247.7 176.9 242.8 169.4 238.9 161.7 C 234.9 153.9 232.4 145.5 231.5 136.6 C 230.6 127.6 229.8 117.9 233.3 108 C 236.7 98 242.2 86.7 252 76.9 C 261.8 67.2 276.7 56.9 292 49.3 C 307.3 41.6 327 35.7 343.9 31 C 360.8 26.4 377.9 24.2 393.3 21.3 C 408.6 18.3 421.9 16.2 436 13.4 C 450.1 10.6 463.5 6.9 477.8 4.3 C 492.2 1.8 507.5 -1.1 521.9 -2 C 536.4 -2.9 551.1 -2.7 564.6 -1.3 C 578.1 0.2 590.9 2.9 602.8 6.6 C 614.7 10.2 626.6 14.6 635.8 20.4 C 645 26.2 654.2 33.2 658.2 41.4 Z",
  "M 597.6 58.8 C 600.5 64.7 601.2 72.1 598.8 79.2 C 596.4 86.3 590 94.3 583.3 101.3 C 576.6 108.2 567 114.9 558.7 121.1 C 550.3 127.3 541.9 132.8 533.4 138.6 C 525 144.3 517.1 150.2 507.8 155.5 C 498.5 160.8 488.3 166.4 477.5 170.4 C 466.8 174.4 454.5 177.6 443.3 179.5 C 432.2 181.3 420.9 181.5 410.5 181.6 C 400.2 181.7 390.7 180.8 381.2 180.1 C 371.6 179.4 362.2 178.8 353.1 177.4 C 344 176 334.5 174.6 326.7 171.8 C 318.9 169.1 311.8 165.4 306.5 161 C 301.2 156.7 297.6 151.2 294.7 145.6 C 291.9 140.1 290.1 134 289.4 127.5 C 288.7 121.1 288.2 114 290.7 106.9 C 293.2 99.7 297.2 91.5 304.3 84.5 C 311.3 77.4 322.1 70 333.1 64.5 C 344.2 58.9 358.4 54.7 370.6 51.3 C 382.8 47.9 395.2 46.4 406.2 44.2 C 417.3 42.1 426.9 40.6 437.1 38.6 C 447.3 36.5 457 33.9 467.3 32 C 477.7 30.2 488.7 28.1 499.2 27.4 C 509.6 26.8 520.3 26.9 530 28 C 539.7 29 549 31 557.6 33.6 C 566.1 36.2 574.7 39.4 581.4 43.6 C 588.1 47.8 594.7 52.9 597.6 58.8 Z",
  "M 543 74.5 C 544.9 78.3 545.4 83.2 543.8 87.8 C 542.3 92.4 538.1 97.6 533.7 102.2 C 529.3 106.8 523 111.1 517.6 115.2 C 512.1 119.2 506.6 122.8 501.1 126.6 C 495.5 130.3 490.4 134.2 484.3 137.7 C 478.2 141.1 471.6 144.8 464.5 147.4 C 457.5 150 449.5 152.1 442.2 153.3 C 434.9 154.6 427.5 154.7 420.7 154.7 C 414 154.8 407.8 154.2 401.5 153.8 C 395.3 153.3 389.1 152.9 383.2 152 C 377.2 151.1 371 150.1 365.9 148.3 C 360.8 146.6 356.2 144.1 352.7 141.3 C 349.2 138.4 346.9 134.9 345 131.2 C 343.2 127.6 342 123.6 341.5 119.4 C 341.1 115.1 340.8 110.6 342.4 105.9 C 344 101.2 346.6 95.8 351.2 91.2 C 355.9 86.6 362.9 81.8 370.1 78.2 C 377.4 74.5 386.6 71.7 394.6 69.5 C 402.6 67.3 410.7 66.3 417.9 64.9 C 425.2 63.5 431.4 62.5 438.1 61.2 C 444.8 59.9 451.1 58.1 457.9 56.9 C 464.6 55.7 471.9 54.4 478.7 53.9 C 485.5 53.5 492.5 53.6 498.8 54.3 C 505.2 55 511.3 56.3 516.9 58 C 522.5 59.7 528.1 61.8 532.5 64.5 C 536.8 67.3 541.1 70.6 543 74.5 Z",
  "M 494.5 88.4 C 495.5 90.4 495.8 93 495 95.4 C 494.1 97.9 491.9 100.6 489.6 103 C 487.3 105.5 483.9 107.8 481.1 109.9 C 478.2 112.1 475.3 114 472.3 116 C 469.4 117.9 466.7 120 463.5 121.8 C 460.2 123.7 456.7 125.6 453 127 C 449.3 128.4 445 129.5 441.2 130.1 C 437.3 130.8 433.4 130.8 429.8 130.9 C 426.2 130.9 422.9 130.6 419.6 130.4 C 416.3 130.1 413.1 129.9 409.9 129.4 C 406.8 128.9 403.5 128.4 400.8 127.5 C 398.1 126.5 395.6 125.2 393.8 123.7 C 391.9 122.2 390.7 120.4 389.7 118.4 C 388.7 116.5 388.1 114.4 387.9 112.1 C 387.6 109.9 387.5 107.5 388.3 105 C 389.2 102.5 390.6 99.7 393 97.2 C 395.5 94.8 399.2 92.2 403 90.3 C 406.8 88.4 411.8 86.9 416 85.8 C 420.2 84.6 424.5 84.1 428.3 83.3 C 432.2 82.6 435.5 82.1 439 81.3 C 442.5 80.6 445.9 79.7 449.5 79.1 C 453 78.4 456.9 77.7 460.5 77.5 C 464.1 77.3 467.8 77.3 471.2 77.7 C 474.5 78 477.7 78.7 480.7 79.6 C 483.7 80.5 486.6 81.6 488.9 83.1 C 491.3 84.6 493.5 86.3 494.5 88.4 Z",
  "M 461.2 97.9 C 461.6 98.7 461.7 99.7 461.4 100.7 C 461.1 101.6 460.2 102.7 459.3 103.6 C 458.4 104.6 457.1 105.5 456 106.3 C 454.9 107.1 453.7 107.9 452.6 108.7 C 451.4 109.4 450.4 110.2 449.1 110.9 C 447.9 111.6 446.5 112.4 445.1 112.9 C 443.6 113.5 442 113.9 440.4 114.2 C 438.9 114.4 437.4 114.4 436 114.4 C 434.6 114.5 433.4 114.3 432.1 114.2 C 430.8 114.2 429.5 114.1 428.3 113.9 C 427.1 113.7 425.8 113.5 424.7 113.1 C 423.7 112.8 422.7 112.3 422 111.7 C 421.3 111.1 420.8 110.4 420.4 109.6 C 420.1 108.9 419.8 108 419.7 107.2 C 419.6 106.3 419.6 105.4 419.9 104.4 C 420.2 103.4 420.8 102.3 421.7 101.4 C 422.7 100.4 424.1 99.4 425.6 98.7 C 427.1 97.9 429 97.4 430.7 96.9 C 432.3 96.5 434 96.2 435.5 96 C 436.9 95.7 438.2 95.5 439.6 95.2 C 441 94.9 442.3 94.6 443.7 94.3 C 445.1 94.1 446.6 93.8 448 93.7 C 449.4 93.6 450.8 93.6 452.1 93.8 C 453.4 93.9 454.7 94.2 455.8 94.5 C 457 94.9 458.1 95.3 459 95.9 C 459.9 96.4 460.8 97.1 461.2 97.9 Z",
];

const KNOLL = [
  "M 647.8 436.8 C 644.7 442.5 640.3 447.8 635.1 451.9 C 630 456 623.5 459.2 617 461.5 C 610.5 463.9 603.2 465.1 596.1 465.9 C 589.1 466.6 581.8 466.6 574.6 466.1 C 567.5 465.7 560.3 464.8 553.2 463.2 C 546.1 461.7 538.9 459.6 532 456.9 C 525.2 454.1 518.4 450.6 512.1 446.6 C 505.8 442.6 499.9 437.9 494.4 433 C 488.9 428 483.8 422.7 478.9 417 C 474 411.3 469.2 405.3 465.1 398.7 C 460.9 392.2 456.6 385.1 454 377.9 C 451.4 370.6 449.3 362.5 449.6 355.3 C 449.9 348.1 451.9 340.5 455.8 334.7 C 459.7 329 466.2 324 472.9 320.9 C 479.6 317.7 488.3 316.4 496 315.7 C 503.7 314.9 511.9 316 519.1 316.4 C 526.3 316.8 532.8 317.8 539.3 318.1 C 545.9 318.5 551.9 318.3 558.6 318.5 C 565.3 318.8 572.4 318.5 579.8 319.7 C 587.1 320.9 595.3 322.5 602.7 325.6 C 610.1 328.7 617.7 333.2 624 338.4 C 630.2 343.5 635.7 350 640 356.5 C 644.2 362.9 647.3 370.1 649.7 376.9 C 652.1 383.8 653.5 390.9 654.2 397.8 C 654.9 404.6 655 411.6 653.9 418.1 C 652.9 424.6 651 431.2 647.8 436.8 Z",
  "M 613.7 418.7 C 611.7 422.2 608.9 425.5 605.7 428.1 C 602.4 430.7 598.4 432.7 594.3 434.2 C 590.2 435.6 585.6 436.4 581.2 436.9 C 576.8 437.4 572.2 437.3 567.7 437.1 C 563.2 436.8 558.7 436.2 554.2 435.2 C 549.8 434.3 545.3 433 541 431.2 C 536.7 429.5 532.4 427.3 528.4 424.8 C 524.5 422.3 520.8 419.4 517.3 416.2 C 513.9 413.1 510.7 409.8 507.6 406.2 C 504.5 402.6 501.5 398.8 498.9 394.7 C 496.3 390.7 493.6 386.2 492 381.6 C 490.3 377.1 489 372 489.2 367.5 C 489.4 363 490.6 358.2 493.1 354.5 C 495.5 350.9 499.6 347.8 503.8 345.8 C 508 343.9 513.5 343 518.3 342.6 C 523.2 342.1 528.3 342.8 532.8 343 C 537.4 343.3 541.4 343.9 545.5 344.1 C 549.7 344.4 553.4 344.2 557.6 344.4 C 561.9 344.6 566.3 344.4 570.9 345.1 C 575.5 345.8 580.7 346.9 585.3 348.8 C 590 350.8 594.8 353.6 598.7 356.8 C 602.6 360.1 606 364.2 608.7 368.2 C 611.4 372.2 613.4 376.7 614.9 381.1 C 616.3 385.4 617.2 389.8 617.7 394.1 C 618.1 398.4 618.2 402.8 617.5 406.9 C 616.8 411 615.6 415.1 613.7 418.7 Z",
  "M 583.8 402.8 C 582.8 404.5 581.5 406.1 579.9 407.3 C 578.4 408.6 576.4 409.5 574.4 410.2 C 572.5 410.9 570.3 411.3 568.1 411.5 C 566 411.8 563.8 411.8 561.6 411.6 C 559.5 411.5 557.3 411.2 555.1 410.7 C 553 410.3 550.8 409.7 548.8 408.8 C 546.7 408 544.6 406.9 542.7 405.7 C 540.8 404.5 539.1 403.1 537.4 401.6 C 535.7 400.1 534.2 398.5 532.7 396.8 C 531.2 395 529.8 393.2 528.5 391.2 C 527.3 389.3 525.9 387.1 525.2 384.9 C 524.4 382.7 523.7 380.3 523.8 378.1 C 523.9 375.9 524.5 373.6 525.7 371.9 C 526.9 370.2 528.8 368.7 530.9 367.7 C 532.9 366.7 535.5 366.4 537.9 366.1 C 540.2 365.9 542.7 366.2 544.8 366.3 C 547 366.5 549 366.8 551 366.9 C 553 367 554.7 366.9 556.8 367 C 558.8 367.1 561 367 563.2 367.3 C 565.4 367.7 567.9 368.2 570.1 369.1 C 572.3 370.1 574.7 371.4 576.5 373 C 578.4 374.5 580.1 376.5 581.4 378.5 C 582.7 380.4 583.6 382.6 584.3 384.7 C 585.1 386.7 585.5 388.9 585.7 390.9 C 585.9 393 585.9 395.1 585.6 397.1 C 585.3 399.1 584.7 401.1 583.8 402.8 Z",
];

const SHORE = [
  "M 380.6 290.2 C 384.2 298.3 379.3 310.2 374 320.9 C 368.7 331.5 357.7 343.2 348.6 354.1 C 339.5 365 331.8 375.8 319.1 386.2 C 306.4 396.6 290.2 408 272.2 416.5 C 254.2 425 229.8 431.5 211 437.4 C 192.3 443.3 175.7 445.9 160 451.9 C 144.2 457.9 132.7 465.5 116.6 473.4 C 100.6 481.3 82.4 492.1 63.6 499.5 C 44.7 506.9 23.1 513.5 3.4 517.8 C -16.3 522.2 -37.1 524.9 -54.7 525.4 C -72.2 526 -90.1 524.8 -102.1 521 C -114.1 517.2 -121.5 509.8 -126.8 502.6 C -132.1 495.3 -132.6 486.1 -134 477.5 C -135.4 469 -137.9 460.8 -135.1 451.3 C -132.2 441.8 -127.1 431 -117 420.8 C -106.9 410.5 -88.5 399.3 -74.4 389.6 C -60.3 379.8 -45.3 371.7 -32.5 362.3 C -19.7 352.9 -11.4 342.8 2.2 333.2 C 15.8 323.6 31.9 312 49.3 304.5 C 66.7 296.9 88.4 291.9 106.6 288 C 124.7 284.1 141.6 283.5 158.4 281.2 C 175.2 278.9 190.8 276.2 207.3 274.1 C 223.7 271.9 240.7 269.4 257.1 268.3 C 273.5 267.2 290 266.8 305.9 267.5 C 321.8 268.2 340 268.8 352.5 272.6 C 365 276.4 377 282.2 380.6 290.2 Z",
  "M 352.5 300.5 C 355.7 307.7 351.3 318.4 346.5 327.9 C 341.7 337.5 332 347.9 323.8 357.7 C 315.6 367.4 308.8 377.1 297.4 386.4 C 286 395.7 271.5 405.9 255.4 413.5 C 239.3 421.2 217.4 427 200.7 432.3 C 183.9 437.5 169 439.9 154.9 445.2 C 140.9 450.6 130.5 457.3 116.2 464.4 C 101.8 471.5 85.5 481.2 68.7 487.8 C 51.8 494.4 32.4 500.4 14.8 504.2 C -2.8 508.1 -21.4 510.6 -37.2 511 C -52.9 511.5 -68.9 510.5 -79.6 507.1 C -90.4 503.7 -97 497 -101.7 490.5 C -106.5 484.1 -107 475.8 -108.2 468.1 C -109.4 460.5 -111.7 453.1 -109.2 444.7 C -106.6 436.2 -102 426.5 -93 417.3 C -83.9 408.1 -67.5 398.1 -54.9 389.4 C -42.3 380.7 -28.8 373.4 -17.4 365 C -5.9 356.6 1.5 347.6 13.7 338.9 C 25.9 330.3 40.3 320 55.9 313.2 C 71.5 306.5 90.9 301.9 107.1 298.5 C 123.4 295 138.5 294.5 153.5 292.4 C 168.5 290.3 182.5 288 197.3 286 C 212 284.1 227.2 281.9 241.9 280.9 C 256.6 279.9 271.3 279.5 285.6 280.2 C 299.8 280.8 316.1 281.3 327.3 284.7 C 338.4 288.1 349.3 293.3 352.5 300.5 Z",
];

const LAKE =
  "M 328.6 309.2 C 331.5 315.6 327.6 325.3 323.3 333.9 C 319 342.5 310.2 351.9 302.8 360.7 C 295.4 369.5 289.3 378.2 279 386.6 C 268.8 395 255.7 404.1 241.2 411 C 226.7 417.9 207 423.1 191.9 427.9 C 176.8 432.6 163.4 434.7 150.7 439.6 C 138 444.4 128.7 450.5 115.7 456.9 C 102.8 463.3 88.2 472 72.9 477.9 C 57.7 483.9 40.3 489.2 24.4 492.7 C 8.5 496.2 -8.2 498.4 -22.4 498.8 C -36.6 499.3 -50.9 498.4 -60.6 495.3 C -70.3 492.2 -76.3 486.2 -80.6 480.4 C -84.8 474.5 -85.3 467.1 -86.4 460.2 C -87.5 453.3 -89.5 446.7 -87.2 439 C -85 431.4 -80.8 422.7 -72.6 414.4 C -64.5 406.1 -49.7 397.1 -38.3 389.3 C -27 381.4 -14.8 374.8 -4.5 367.3 C 5.8 359.7 12.5 351.6 23.5 343.8 C 34.4 336 47.4 326.7 61.5 320.6 C 75.5 314.6 93 310.5 107.6 307.3 C 122.3 304.2 135.9 303.7 149.4 301.9 C 162.9 300 175.6 297.9 188.8 296.1 C 202.1 294.4 215.8 292.4 229 291.5 C 242.3 290.6 255.5 290.3 268.4 290.8 C 281.2 291.4 295.9 291.9 306 294.9 C 316 298 325.7 302.7 328.6 309.2 Z";

/** Site position on the sheet, in user units and as a fraction of it. */
const SITE = { x: 336, y: 244 } as const;
const SITE_LEFT = `${((SITE.x / 640) * 100).toFixed(3)}%`;
const SITE_TOP = `${((SITE.y / 448) * 100).toFixed(3)}%`;

const GRID_X = Array.from({ length: 21 }, (_, i) => i * 32);
const GRID_Y = Array.from({ length: 15 }, (_, i) => i * 32);

/* Ink weight climbs as the land rises, so the crest reads as the high point. */
const RIDGE_INK = [0.14, 0.185, 0.23, 0.275, 0.32, 0.365];
const RIDGE_WIDTH = [0.75, 0.75, 0.75, 0.75, 1, 1];
const KNOLL_INK = [0.4, 0.52, 0.64];
const SHORE_INK = [0.18, 0.26];

/** Registration marks at the sheet corners, the way a drawing is trimmed. */
const CORNERS = [
  "M 14 30 V 14 H 30",
  "M 610 14 H 626 V 30",
  "M 626 418 V 434 H 610",
  "M 30 434 H 14 V 418",
];

const site = CONTACT.location;
const coordParts = site.coordinates.split(",").map((part) => part.trim());
const latLabel = coordParts[0] || site.coordinates;
const lngLabel = coordParts[1] || "";

/**
 * Section 06 — Setting.
 *
 * A drawn contour sheet instead of a map widget: the geography is generated
 * geometry, the lettering sits in real HTML above the drawing so it stays
 * crisp at every width, and the whole thing draws itself once on entry.
 *
 * Note the proximity values are deliberately never counted up — "2 hr 10"
 * is not a number, and a count-up would render NaN.
 */
export function LocationSection() {
  const rootRef = useRef<HTMLElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const bandRef = useRef<HTMLElement | null>(null);

  useGsap(
    () => {
      const map = mapRef.current;

      if (map) {
        const contours = Array.from(
          map.querySelectorAll<SVGPathElement>("[data-contour]")
        );
        const soft = Array.from(map.querySelectorAll("[data-map-soft]"));

        if (prefersReducedMotion()) {
          drawPlan(contours);
          gsap.set(soft, { autoAlpha: 1 });
        } else {
          // Initial state is set pre-paint, so the sheet starts blank — but
          // stays fully drawn if JS never runs at all.
          gsap.set(contours, { drawSVG: "0%" });
          gsap.set(soft, { autoAlpha: 0 });

          ScrollTrigger.create({
            trigger: map,
            start: "top 80%",
            once: true,
            onEnter: () => {
              drawPlan(contours, { stagger: 0.075 });
              gsap.to(soft, {
                autoAlpha: 1,
                duration: DUR.slow,
                ease: EASE.out,
                stagger: 0.05,
                delay: 0.55,
                overwrite: true,
              });
            },
          });
        }
      }

      const panel = panelRef.current;
      if (panel) {
        revealUp(panel.querySelectorAll("[data-loc-head]"), {
          y: 22,
          stagger: 0.1,
          trigger: panel,
          start: "top 88%",
        });
        revealUp(panel.querySelectorAll("[data-loc-row]"), {
          y: 26,
          stagger: 0.09,
          trigger: panel,
          start: "top 82%",
          delay: 0.15,
        });
      }

      revealUp(bandRef.current, { y: 44, trigger: bandRef.current, start: "top 90%" });
    },
    rootRef,
    []
  );

  return (
    <section
      ref={rootRef}
      id="location"
      className="border-t border-hairline-soft px-6 py-28 md:px-12 lg:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          index="06"
          eyebrow="Setting"
          title="Above the Lake, Below the Ridge"
          lede="Held on a south-west shoulder of the Lombardy hills, twenty minutes from the water and an hour from Milan."
          className="mb-16"
        />

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-14">
          {/* ---------------------------------------------------------- */}
          {/* The sheet                                                   */}
          {/* ---------------------------------------------------------- */}
          <div
            ref={mapRef}
            className="rounded-card relative overflow-hidden border border-hairline bg-ink-deep lg:col-span-7"
          >
            <svg
              viewBox="0 0 640 448"
              role="img"
              aria-label={`Stylised survey drawing of the setting: a ridge crest to the north-east, the shoreline of the lake to the south-west, and the villa marked between them at ${site.coordinates}.`}
              className="block h-auto w-full"
            >
              <defs>
                <linearGradient id="location-water" x1="0" y1="0" x2="0.8" y2="1">
                  <stop offset="0%" stopColor="var(--color-champagne)" stopOpacity="0.13" />
                  <stop offset="100%" stopColor="var(--color-champagne)" stopOpacity="0.03" />
                </linearGradient>

                {/* Light sitting over the crest, so the sheet has air in it */}
                <radialGradient id="location-air" cx="0.62" cy="0.24" r="0.62">
                  <stop offset="0%" stopColor="var(--color-champagne)" stopOpacity="0.11" />
                  <stop offset="55%" stopColor="var(--color-champagne)" stopOpacity="0.03" />
                  <stop offset="100%" stopColor="var(--color-champagne)" stopOpacity="0" />
                </radialGradient>

                {/* Halo around the site mark */}
                <radialGradient id="location-halo" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0%" stopColor="var(--color-champagne)" stopOpacity="0.5" />
                  <stop offset="45%" stopColor="var(--color-champagne)" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="var(--color-champagne)" stopOpacity="0" />
                </radialGradient>

                {/* Corners fall away, the way ink thins at the edge of a sheet */}
                <radialGradient id="location-fade" cx="0.5" cy="0.5" r="0.72">
                  <stop offset="0%" stopColor="#000" stopOpacity="0" />
                  <stop offset="72%" stopColor="#000" stopOpacity="0" />
                  <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
                </radialGradient>

                <filter id="location-bloom" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2.4" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Atmosphere over the high ground */}
              <rect
                aria-hidden="true"
                data-map-soft
                width="640"
                height="448"
                fill="url(#location-air)"
              />

              {/* Drafting grid */}
              <g aria-hidden="true" data-map-soft>
                {GRID_X.map((x) => (
                  <line
                    key={`gx-${x}`}
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={448}
                    stroke="var(--color-bone)"
                    strokeOpacity={x % 128 === 0 ? 0.075 : 0.03}
                    strokeWidth={0.5}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {GRID_Y.map((y) => (
                  <line
                    key={`gy-${y}`}
                    x1={0}
                    y1={y}
                    x2={640}
                    y2={y}
                    stroke="var(--color-bone)"
                    strokeOpacity={y % 128 === 0 ? 0.075 : 0.03}
                    strokeWidth={0.5}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                <rect
                  x={12}
                  y={12}
                  width={616}
                  height={424}
                  fill="none"
                  stroke="var(--color-bone)"
                  strokeOpacity={0.07}
                  strokeWidth={0.75}
                  vectorEffect="non-scaling-stroke"
                />
              </g>

              {/* Hypsometric tint. The rings nest, so each fill layers over the
                  one below and the land reads as rising ground rather than as a
                  stack of loops. */}
              <g aria-hidden="true" data-map-soft stroke="none">
                {SHORE.map((d, i) => (
                  <path key={`shore-fill-${i}`} d={d} fill="var(--color-champagne)" fillOpacity={0.012} />
                ))}
                {RIDGE.map((d, i) => (
                  <path
                    key={`ridge-fill-${i}`}
                    d={d}
                    fill="var(--color-champagne)"
                    fillOpacity={0.014 + i * 0.004}
                  />
                ))}
                {KNOLL.map((d, i) => (
                  <path
                    key={`knoll-fill-${i}`}
                    d={d}
                    fill="var(--color-bronze)"
                    fillOpacity={0.02 + i * 0.006}
                  />
                ))}
              </g>

              {/* Land — the ridge, the smaller rise, then the shore steps */}
              <g aria-hidden="true" fill="none" strokeLinejoin="round">
                {RIDGE.map((d, i) => (
                  <path
                    key={`ridge-${i}`}
                    data-contour
                    d={d}
                    stroke="var(--color-champagne)"
                    strokeOpacity={RIDGE_INK[i] ?? 0.2}
                    strokeWidth={RIDGE_WIDTH[i] ?? 0.75}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {KNOLL.map((d, i) => (
                  <path
                    key={`knoll-${i}`}
                    data-contour
                    d={d}
                    stroke="var(--color-bronze)"
                    strokeOpacity={KNOLL_INK[i] ?? 0.4}
                    strokeWidth={0.75}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {SHORE.map((d, i) => (
                  <path
                    key={`shore-${i}`}
                    data-contour
                    d={d}
                    stroke="var(--color-champagne)"
                    strokeOpacity={SHORE_INK[i] ?? 0.16}
                    strokeWidth={0.75}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </g>

              {/* The crest itself — long dashes along the ridge line */}
              <path
                aria-hidden="true"
                data-map-soft
                d="M 196 176 C 280 148 352 128 424 108 C 496 88 566 68 640 46"
                fill="none"
                stroke="var(--color-champagne)"
                strokeOpacity={0.22}
                strokeWidth={0.75}
                strokeDasharray="10 7"
                vectorEffect="non-scaling-stroke"
              />

              {/* Water. The opaque pass masks any land contour that would
                  otherwise run through the lake, so the sheet stays honest. */}
              <path aria-hidden="true" d={LAKE} fill="var(--color-ink-deep)" />
              <path aria-hidden="true" data-map-soft d={LAKE} fill="url(#location-water)" />

              {/* Still-water ruling, clipped to the waterline */}
              <clipPath id="location-lake-clip">
                <path d={LAKE} />
              </clipPath>
              <g aria-hidden="true" data-map-soft clipPath="url(#location-lake-clip)">
                {Array.from({ length: 13 }, (_, i) => 300 + i * 17).map((y, i) => (
                  <line
                    key={`ripple-${y}`}
                    x1={-120}
                    y1={y}
                    x2={400}
                    y2={y}
                    stroke="var(--color-champagne)"
                    strokeOpacity={0.16 - i * 0.008}
                    strokeWidth={0.5}
                    strokeDasharray={i % 2 === 0 ? "26 15" : "14 21"}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </g>

              <path
                aria-hidden="true"
                data-contour
                d={LAKE}
                fill="none"
                stroke="var(--color-champagne)"
                strokeOpacity={0.42}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />

              {/* The approach, up from the valley road */}
              <path
                aria-hidden="true"
                data-map-soft
                d="M 296 448 C 304 404 328 374 324 332 C 321 298 330 268 336 248"
                fill="none"
                stroke="var(--color-bone)"
                strokeOpacity={0.26}
                strokeWidth={0.75}
                strokeDasharray="3 4"
                vectorEffect="non-scaling-stroke"
              />

              {/* Crosshair rules through the site */}
              <g
                aria-hidden="true"
                data-map-soft
                stroke="var(--color-champagne)"
                strokeOpacity={0.3}
                strokeWidth={0.75}
                strokeDasharray="7 5"
              >
                <line x1={0} y1={SITE.y} x2={640} y2={SITE.y} vectorEffect="non-scaling-stroke" />
                <line x1={SITE.x} y1={0} x2={SITE.x} y2={448} vectorEffect="non-scaling-stroke" />
              </g>

              {/* Site mark. The knockout disc interrupts the linework around
                  the mark the way a draughtsman would, so the contours and the
                  crosshair never run through it. */}
              <g aria-hidden="true" data-map-soft>
                <circle cx={SITE.x} cy={SITE.y} r={54} fill="url(#location-halo)" />
                <circle cx={SITE.x} cy={SITE.y} r={13.5} fill="var(--color-ink-deep)" />
                <circle
                  cx={SITE.x}
                  cy={SITE.y}
                  r={13}
                  fill="none"
                  stroke="var(--color-champagne)"
                  strokeOpacity={0.6}
                  strokeWidth={0.75}
                  vectorEffect="non-scaling-stroke"
                />
                {/* Survey ring, breathing slowly */}
                <circle
                  cx={SITE.x}
                  cy={SITE.y}
                  r={22}
                  fill="none"
                  stroke="var(--color-champagne)"
                  strokeOpacity={0.3}
                  strokeWidth={0.75}
                  strokeDasharray="2 6"
                  vectorEffect="non-scaling-stroke"
                  className="motion-safe:animate-[horizon-survey_9s_linear_infinite]"
                  style={{ transformOrigin: `${SITE.x}px ${SITE.y}px` }}
                />
                <circle
                  cx={SITE.x}
                  cy={SITE.y}
                  r={3.6}
                  fill="var(--color-champagne-bright)"
                  filter="url(#location-bloom)"
                />
                <g stroke="var(--color-champagne)" strokeWidth={1} vectorEffect="non-scaling-stroke">
                  <line x1={SITE.x} y1={SITE.y - 30} x2={SITE.x} y2={SITE.y - 17} />
                  <line x1={SITE.x} y1={SITE.y + 17} x2={SITE.x} y2={SITE.y + 30} />
                  <line x1={SITE.x - 30} y1={SITE.y} x2={SITE.x - 17} y2={SITE.y} />
                  <line x1={SITE.x + 17} y1={SITE.y} x2={SITE.x + 30} y2={SITE.y} />
                </g>
              </g>

              {/* Spot heights, the way a surveyor annotates the ground */}
              <g
                aria-hidden="true"
                data-map-soft
                fill="var(--color-champagne)"
                fillOpacity={0.34}
                fontFamily="ui-monospace, monospace"
                fontSize={8.5}
                letterSpacing={1.1}
              >
                <text x={452} y={101}>720</text>
                <text x={392} y={143}>680</text>
                <text x={330} y={181}>640</text>
                <text x={555} y={385}>560</text>
                <text x={92} y={430} fillOpacity={0.26}>198</text>
              </g>

              {/* Ink thins toward the trim edge */}
              <rect
                aria-hidden="true"
                data-map-soft
                width="640"
                height="448"
                fill="url(#location-fade)"
                style={{ pointerEvents: "none" }}
              />

              {/* Trim marks */}
              <g
                aria-hidden="true"
                data-map-soft
                fill="none"
                stroke="var(--color-champagne)"
                strokeOpacity={0.4}
                strokeWidth={1}
              >
                {CORNERS.map((d) => (
                  <path key={d} d={d} vectorEffect="non-scaling-stroke" />
                ))}
              </g>
            </svg>

            {/* Sheet lettering, kept in HTML so it never scales down to a smudge */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-0" style={{ top: SITE_TOP }}>
                <span
                  data-map-soft
                  className="tabular absolute bottom-1.5 left-4 font-mono text-[10px] tracking-[0.14em] text-stone-dim"
                >
                  {latLabel}
                </span>
              </div>

              {lngLabel && (
                <div className="absolute inset-y-0" style={{ left: SITE_LEFT }}>
                  <span
                    data-map-soft
                    className="tabular absolute bottom-4 left-2.5 font-mono text-[10px] tracking-[0.14em] text-stone-dim"
                  >
                    {lngLabel}
                  </span>
                </div>
              )}

              <div className="absolute" style={{ left: SITE_LEFT, top: SITE_TOP }}>
                <span
                  data-map-soft
                  className="absolute bottom-4 left-4 whitespace-nowrap bg-ink-deep/85 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-champagne-bright md:text-[11px]"
                >
                  Villa Horizon
                </span>
              </div>

              <span
                data-map-soft
                className="absolute left-[7%] top-[80%] origin-left -rotate-[20deg] font-mono text-[10px] uppercase tracking-[0.34em] text-stone-dim md:text-[11px]"
              >
                Lago di Como
              </span>

              {/* North */}
              <span
                data-map-soft
                className="absolute right-4 top-4 flex flex-col items-center gap-1 bg-ink-deep/80 px-2 py-1.5"
              >
                <svg viewBox="0 0 12 24" className="h-5 w-3" aria-hidden="true">
                  <path
                    d="M 6 23 V 4"
                    fill="none"
                    stroke="var(--color-champagne)"
                    strokeOpacity="0.6"
                    strokeWidth="1"
                  />
                  <path d="M 6 0 L 10 9 L 6 6.6 L 2 9 Z" fill="var(--color-champagne)" />
                </svg>
                <span className="font-mono text-[10px] tracking-[0.2em] text-champagne">N</span>
              </span>

              {/* Scale bar */}
              <span
                data-map-soft
                className="absolute bottom-4 right-4 flex items-center gap-2.5 bg-ink-deep/80 px-2 py-1.5"
              >
                <span className="flex h-1.5 items-center">
                  <span className="h-1.5 w-px bg-champagne/60" />
                  <span className="h-px w-8 bg-champagne/35 sm:w-12" />
                  <span className="h-1.5 w-px bg-champagne/60" />
                </span>
                <span className="font-mono text-[10px] tracking-[0.18em] text-stone-dim">1 km</span>
              </span>

              {/* Title block, the way a drawing sheet is stamped */}
              <span
                data-map-soft
                className="absolute left-9 top-5 hidden flex-col gap-1 border-l border-champagne/30 pl-3 sm:flex"
              >
                <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-champagne/70">
                  Site survey — sheet 01
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone-dim">
                  Contours at 40 m · Atelier Vermeer
                </span>
              </span>
            </div>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* The facts                                                   */}
          {/* ---------------------------------------------------------- */}
          <div ref={panelRef} className="lg:col-span-5">
            <h3
              data-loc-head
              className="font-display text-[clamp(1.55rem,2.8vw,2.15rem)] font-light leading-[1.15] text-bone"
            >
              {site.place}
            </h3>

            <p data-loc-head className="tabular mt-4 font-mono text-xs tracking-[0.16em] text-champagne">
              {site.coordinates}
            </p>

            <p
              data-loc-head
              className="mt-10 font-mono text-[10px] uppercase tracking-[0.24em] text-stone-dim"
            >
              Approximate drive time
            </p>

            <dl className="mt-5 border-t border-hairline">
              {site.proximities.map((proximity) => (
                <div
                  key={proximity.label}
                  data-loc-row
                  className="flex items-baseline justify-between gap-6 border-b border-hairline-soft py-4"
                >
                  <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-stone">
                    {proximity.label}
                  </dt>
                  <dd className="tabular font-mono text-sm text-bone">{proximity.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* Grounding band                                                */}
        {/* ------------------------------------------------------------ */}
        <figure
          ref={bandRef}
          className="rounded-card relative mt-16 overflow-hidden border border-hairline md:mt-20"
        >
          <div className="relative aspect-[16/9] w-full sm:aspect-[21/9] lg:aspect-[24/9]">
            <Image
              src="/stills/dusk.webp"
              alt="Villa Horizon at dusk, held on the hillside above Lake Como."
              fill
              sizes="(min-width: 1280px) 1216px, 100vw"
              className="object-cover"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent"
            />
          </div>
        </figure>
      </div>
    </section>
  );
}
